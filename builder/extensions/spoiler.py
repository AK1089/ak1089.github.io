from markdown.extensions import Extension
from markdown.inlinepatterns import InlineProcessor
import xml.etree.ElementTree as etree

class SpoilerFormatter(Extension):
   def extendMarkdown(self, md):
       md.inlinePatterns.register(
           SpoilerPattern(r'\|\|([^|]+)\|\|'), 'spoiler', 175
       )

class SpoilerPattern(InlineProcessor):
   def handleMatch(self, m, data):
       text = m.group(1)
       span = etree.Element('span')
       span.set('class', 'spoiler')
       inner_span = etree.SubElement(span, 'span')
       inner_span.text = text
       return span, m.start(0), m.end(0)