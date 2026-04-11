#!/usr/bin/env python3
"""Verify the three propositions behind the S-bishop three-move theorem."""

from __future__ import annotations

import argparse
from collections import Counter, deque
from functools import lru_cache
from itertools import combinations, combinations_with_replacement, product
from math import comb
from typing import Any, Iterable

BOARD_SIDE = 8
BOARD_VALUES = tuple(range(BOARD_SIDE))
PATTERNS = (
    (4, 2, 1),
    (4, 1, 3),
    (1, 2, 4),
    (3, 1, 4),
)

Pair = tuple[int, int]
Pattern = tuple[int, int, int]
Point = tuple[int, ...]
MoveVector = tuple[int, ...]
MoveTriple = tuple[int, int, int]

PAIR_TYPES: tuple[Pair, ...] = tuple((a, b) for a, b in product(BOARD_VALUES, repeat=2))


def format_point(point: Point) -> str:
    return "(" + ", ".join(str(value) for value in point) + ")"


def format_pattern(pattern: Pattern) -> str:
    return "(" + ", ".join(str(length) for length in pattern) + ")"


def apply_moves(start: Point, moves: Iterable[MoveVector]) -> tuple[Point, ...]:
    positions = [start]
    current = list(start)
    for move in moves:
        for axis, delta in enumerate(move):
            current[axis] += delta
        positions.append(tuple(current))
    return tuple(positions)


@lru_cache(maxsize=None)
def coordinate_options(start: int, end: int, pattern: Pattern) -> tuple[MoveTriple, ...]:
    """All legal one-coordinate increment triples for a fixed three-move pattern."""

    options: list[MoveTriple] = []
    first_length, second_length, third_length = pattern
    for first_delta in (0, first_length, -first_length):
        after_first = start + first_delta
        if not 0 <= after_first < BOARD_SIDE:
            continue
        for second_delta in (0, second_length, -second_length):
            after_second = after_first + second_delta
            if not 0 <= after_second < BOARD_SIDE:
                continue
            third_delta = end - start - first_delta - second_delta
            if third_delta not in (0, third_length, -third_length):
                continue
            if not 0 <= after_second + third_delta < BOARD_SIDE:
                continue
            options.append((first_delta, second_delta, third_delta))
    return tuple(options)


@lru_cache(maxsize=None)
def coordinate_support_masks(start: int, end: int, pattern: Pattern) -> tuple[int, ...]:
    masks = {
        ((first != 0) << 0) | ((second != 0) << 1) | ((third != 0) << 2)
        for first, second, third in coordinate_options(start, end, pattern)
    }
    return tuple(sorted(masks))


def capped_add_counts(counts: tuple[int, int, int], mask: int) -> tuple[int, int, int]:
    return (
        min(2, counts[0] + ((mask >> 0) & 1)),
        min(2, counts[1] + ((mask >> 1) & 1)),
        min(2, counts[2] + ((mask >> 2) & 1)),
    )


def find_path_for_pattern(start: Point, end: Point, pattern: Pattern) -> tuple[MoveVector, ...] | None:
    """Construct a three-move witness in dimension >= 4 for one fixed template."""

    if len(start) != len(end):
        raise ValueError("Start and end points must have the same dimension.")
    if len(start) < 4:
        raise ValueError("Template construction requires at least four dimensions.")
    if start == end:
        return tuple()

    options_by_axis = [coordinate_options(source, target, pattern) for source, target in zip(start, end)]
    if any(not options for options in options_by_axis):
        return None

    order = tuple(sorted(range(len(start)), key=lambda axis: len(options_by_axis[axis])))
    reverse_order = {axis: offset for offset, axis in enumerate(order)}

    @lru_cache(maxsize=None)
    def search(offset: int, counts: tuple[int, int, int]) -> tuple[MoveTriple, ...] | None:
        if offset == len(order):
            return tuple() if counts == (2, 2, 2) else None

        axis = order[offset]
        for choice in options_by_axis[axis]:
            result = search(
                offset + 1,
                capped_add_counts(
                    counts,
                    ((choice[0] != 0) << 0) | ((choice[1] != 0) << 1) | ((choice[2] != 0) << 2),
                ),
            )
            if result is not None:
                return (choice,) + result
        return None

    ordered_choices = search(0, (0, 0, 0))
    if ordered_choices is None:
        return None

    choices_by_axis: list[MoveTriple] = [(0, 0, 0)] * len(start)
    for axis in range(len(start)):
        choices_by_axis[axis] = ordered_choices[reverse_order[axis]]

    return tuple(
        tuple(choices_by_axis[axis][move_index] for axis in range(len(start)))
        for move_index in range(3)
    )


def find_high_dimensional_path(start: Point, end: Point) -> tuple[Pattern, tuple[MoveVector, ...]] | None:
    """Construct a theorem witness for dimension >= 4 using Propositions 1 and 2."""

    if len(start) != len(end):
        raise ValueError("Start and end points must have the same dimension.")
    if len(start) < 4:
        raise ValueError("High-dimensional construction requires at least four dimensions.")
    if start == end:
        return None

    for pattern in PATTERNS:
        base_path = find_path_for_pattern(start[:4], end[:4], pattern)
        if base_path is None:
            continue

        moves = [list(move) for move in base_path]
        for source, target in zip(start[4:], end[4:]):
            choices = coordinate_options(source, target, pattern)
            if not choices:
                break
            extension = choices[0]
            for move_index, delta in enumerate(extension):
                moves[move_index].append(delta)
        else:
            return pattern, tuple(tuple(move) for move in moves)
    return None


def legal_step_signs(position_value: int, length: int) -> tuple[int, ...]:
    signs = []
    if position_value + length < BOARD_SIDE:
        signs.append(1)
    if position_value - length >= 0:
        signs.append(-1)
    return tuple(signs)


@lru_cache(maxsize=None)
def legal_s_bishop_moves(position: Point) -> tuple[Point, ...]:
    """All legal one-move destinations for the S-bishop from a given point."""

    destinations: set[Point] = set()
    dimension = len(position)
    for length in range(1, BOARD_SIDE):
        for active_axes in range(2, dimension + 1):
            for axes in combinations(range(dimension), active_axes):
                signs_by_axis = [legal_step_signs(position[axis], length) for axis in axes]
                if any(not signs for signs in signs_by_axis):
                    continue
                for signs in product(*signs_by_axis):
                    destination = list(position)
                    for axis, sign in zip(axes, signs):
                        destination[axis] += sign * length
                    destinations.add(tuple(destination))
    return tuple(sorted(destinations))


def shortest_path_3d(start: Point, end: Point) -> tuple[MoveVector, ...]:
    if len(start) != 3 or len(end) != 3:
        raise ValueError("This solver only applies to 3D points.")
    if start == end:
        return tuple()

    queue: deque[Point] = deque([start])
    parents: dict[Point, Point | None] = {start: None}
    while queue:
        current = queue.popleft()
        if current == end:
            break
        for nxt in legal_s_bishop_moves(current):
            if nxt not in parents:
                parents[nxt] = current
                queue.append(nxt)

    if end not in parents:
        raise ValueError(f"No 3D S-bishop path found from {start} to {end}.")

    positions: list[Point] = [end]
    current = end
    while (prev := parents[current]) is not None:
        current = prev
        positions.append(current)
    positions.reverse()

    return tuple(
        tuple(destination[axis] - source[axis] for axis in range(3))
        for source, destination in zip(positions, positions[1:])
    )


def mask_lookup_for_pattern(pattern: Pattern) -> tuple[tuple[int, ...], ...]:
    return tuple(
        coordinate_support_masks(start, end, pattern)
        for start, end in PAIR_TYPES
    )


def multiset_supports_pattern(
    pair_indices: tuple[int, ...],
    mask_lookup: tuple[tuple[int, ...], ...],
) -> bool:
    """Check a whole coordinate multiset using only support masks.

    The actual signed increments are independent across coordinates; the only cross-coordinate
    coupling is the "at least two active axes per move" rule. Support masks therefore retain
    exactly the data that matters for the 4D verification.
    """

    states = {(0, 0, 0)}
    for pair_index in pair_indices:
        next_states = set()
        for counts in states:
            for mask in mask_lookup[pair_index]:
                next_states.add(capped_add_counts(counts, mask))
        states = next_states
    return (2, 2, 2) in states


def verify_proposition_1() -> dict[str, Any]:
    """Verify the 4D template theorem by reducing to unordered coordinate multisets."""

    total_multisets = comb(len(PAIR_TYPES) + 4 - 1, 4)
    checked_multisets = 0
    mask_lookups = {pattern: mask_lookup_for_pattern(pattern) for pattern in PATTERNS}

    for pair_indices in combinations_with_replacement(range(len(PAIR_TYPES)), 4):
        checked_multisets += 1
        if any(multiset_supports_pattern(pair_indices, mask_lookups[pattern]) for pattern in PATTERNS):
            continue

        counterexample_start = tuple(PAIR_TYPES[pair_index][0] for pair_index in pair_indices)
        counterexample_end = tuple(PAIR_TYPES[pair_index][1] for pair_index in pair_indices)
        return {
            "verified": False,
            "checked_multisets": checked_multisets,
            "total_multisets": total_multisets,
            "counterexample": (counterexample_start, counterexample_end),
        }

    sample_start = (0, 0, 0, 0)
    sample_end = (7, 7, 7, 7)
    sample_pattern, sample_moves = find_high_dimensional_path(sample_start, sample_end) or (None, tuple())
    sample_positions = apply_moves(sample_start, sample_moves) if sample_moves else tuple()
    return {
        "verified": True,
        "checked_multisets": checked_multisets,
        "total_multisets": total_multisets,
        "sample_start": sample_start,
        "sample_end": sample_end,
        "sample_pattern": sample_pattern,
        "sample_moves": sample_moves,
        "sample_positions": sample_positions,
    }


def verify_proposition_2() -> dict[str, Any]:
    """Verify that each template can absorb one extra coordinate independently."""

    checks_per_pattern: dict[Pattern, int] = {}
    sample_extensions: dict[Pattern, tuple[int, int, MoveTriple]] = {}

    for pattern in PATTERNS:
        checks = 0
        for start, end in PAIR_TYPES:
            options = coordinate_options(start, end, pattern)
            if not options:
                return {
                    "verified": False,
                    "pattern": pattern,
                    "counterexample": (start, end),
                }
            checks += 1
            if pattern not in sample_extensions and start != end:
                sample_extensions[pattern] = (start, end, options[0])
        if pattern not in sample_extensions:
            sample_extensions[pattern] = (0, 0, coordinate_options(0, 0, pattern)[0])
        checks_per_pattern[pattern] = checks

    return {
        "verified": True,
        "checks_per_pattern": checks_per_pattern,
        "sample_extensions": sample_extensions,
    }


def verify_proposition_3() -> dict[str, Any]:
    """Verify the 3D theorem directly by exhaustive BFS on the full move graph."""

    positions = tuple(product(BOARD_VALUES, repeat=3))
    distance_histogram: Counter[int] = Counter()
    example_by_distance: dict[int, tuple[Point, Point]] = {}
    diameter = 0

    for start in positions:
        distances = {start: 0}
        queue: deque[Point] = deque([start])
        while queue:
            current = queue.popleft()
            for nxt in legal_s_bishop_moves(current):
                if nxt in distances:
                    continue
                distances[nxt] = distances[current] + 1
                queue.append(nxt)

        if len(distances) != len(positions):
            missing = next(point for point in positions if point not in distances)
            return {
                "verified": False,
                "counterexample": (start, missing),
            }

        local_diameter = max(distances.values())
        diameter = max(diameter, local_diameter)
        for end, distance in distances.items():
            distance_histogram[distance] += 1
            example_by_distance.setdefault(distance, (start, end))

    hardest_pair = example_by_distance[diameter]
    hardest_path = shortest_path_3d(*hardest_pair)
    hardest_positions = apply_moves(hardest_pair[0], hardest_path)

    return {
        "verified": diameter <= 3,
        "diameter": diameter,
        "distance_histogram": dict(sorted(distance_histogram.items())),
        "hardest_pair": hardest_pair,
        "hardest_path": hardest_path,
        "hardest_positions": hardest_positions,
    }


def verify_all() -> tuple[dict[str, Any], dict[str, Any], dict[str, Any]]:
    return (
        verify_proposition_1(),
        verify_proposition_2(),
        verify_proposition_3(),
    )


def parse_point(text: str) -> Point:
    values = tuple(int(part.strip()) for part in text.split(",") if part.strip())
    if not values:
        raise argparse.ArgumentTypeError("Points must contain at least one coordinate.")
    if any(not 0 <= value < BOARD_SIDE for value in values):
        raise argparse.ArgumentTypeError("Each coordinate must lie in {0, ..., 7}.")
    return values


def print_verification_summary(
    proposition_1: dict[str, Any],
    proposition_2: dict[str, Any],
    proposition_3: dict[str, Any],
) -> None:
    if not proposition_1["verified"]:
        start, end = proposition_1["counterexample"]
        print("Proposition 1: FAILED")
        print(f"  Counterexample: {format_point(start)} -> {format_point(end)}")
        return

    print("Proposition 1: verified")
    print(
        "  Checked "
        f"{proposition_1['checked_multisets']} unordered 4D coordinate multisets "
        f"(all {proposition_1['total_multisets']} of them)."
    )
    print(
        "  Sample witness: "
        f"{format_point(proposition_1['sample_start'])} -> {format_point(proposition_1['sample_end'])} "
        f"using pattern {format_pattern(proposition_1['sample_pattern'])}."
    )
    for move_index, move in enumerate(proposition_1["sample_moves"], start=1):
        print(f"    move {move_index}: {format_point(move)}")

    if not proposition_2["verified"]:
        start, end = proposition_2["counterexample"]
        print("Proposition 2: FAILED")
        print(
            f"  Counterexample for pattern {format_pattern(proposition_2['pattern'])}: "
            f"{start} -> {end}"
        )
        return

    print("Proposition 2: verified")
    print("  Every one-dimensional start/end pair works for every template:")
    for pattern in PATTERNS:
        start, end, extension = proposition_2["sample_extensions"][pattern]
        print(
            f"    {format_pattern(pattern)}: {proposition_2['checks_per_pattern'][pattern]} checks, "
            f"sample {start} -> {end} via {extension}"
        )

    if not proposition_3["verified"]:
        start, end = proposition_3["counterexample"]
        print("Proposition 3: FAILED")
        print(f"  Counterexample: {format_point(start)} -> {format_point(end)}")
        return

    print("Proposition 3: verified")
    print(f"  Exhaustive 3D graph diameter: {proposition_3['diameter']}")
    histogram = proposition_3["distance_histogram"]
    histogram_text = ", ".join(f"{distance}: {count}" for distance, count in histogram.items())
    print(f"  Ordered-pair distance histogram: {histogram_text}")
    hardest_start, hardest_end = proposition_3["hardest_pair"]
    print(
        "  Sample diameter-3 pair: "
        f"{format_point(hardest_start)} -> {format_point(hardest_end)}"
    )
    for move_index, move in enumerate(proposition_3["hardest_path"], start=1):
        print(f"    move {move_index}: {format_point(move)}")


def print_path(start: Point, end: Point) -> None:
    if len(start) != len(end):
        raise SystemExit("Start and end points must have the same dimension.")
    if len(start) < 3:
        raise SystemExit("The theorem only applies in dimensions N >= 3.")
    if start == end:
        print("No move needed.")
        return

    if len(start) == 3:
        moves = shortest_path_3d(start, end)
        positions = apply_moves(start, moves)
        print(f"3D shortest path from {format_point(start)} to {format_point(end)}:")
    else:
        witness = find_high_dimensional_path(start, end)
        if witness is None:
            raise SystemExit("No high-dimensional witness found.")
        pattern, moves = witness
        positions = apply_moves(start, moves)
        print(
            f"{len(start)}D template path from {format_point(start)} to {format_point(end)} "
            f"using pattern {format_pattern(pattern)}:"
        )

    for move_index, (source, destination, move) in enumerate(
        zip(positions, positions[1:], moves),
        start=1,
    ):
        active_axes = sum(delta != 0 for delta in move)
        length = abs(next(delta for delta in move if delta != 0))
        print(
            f"  move {move_index}: {format_point(source)} -> {format_point(destination)} "
            f"with {format_point(move)} (length {length}, active axes {active_axes})"
        )


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    subparsers = parser.add_subparsers(dest="command")

    subparsers.add_parser("verify", help="Run the three proposition checks.")

    path_parser = subparsers.add_parser("path", help="Construct an explicit S-bishop path.")
    path_parser.add_argument("start", type=parse_point, help="Comma-separated coordinates.")
    path_parser.add_argument("end", type=parse_point, help="Comma-separated coordinates.")

    return parser


def main() -> None:
    parser = build_parser()
    args = parser.parse_args()

    if args.command in (None, "verify"):
        proposition_1, proposition_2, proposition_3 = verify_all()
        print_verification_summary(proposition_1, proposition_2, proposition_3)
        return

    if args.command == "path":
        print_path(args.start, args.end)
        return

    parser.error(f"Unknown command: {args.command}")


if __name__ == "__main__":
    main()
