/**
 * XML Test Helpers
 * Utilities for parsing, validating, and comparing XML in tests
 */

/**
 * Parse XML string to DOM Document
 */
export function parseXml(xml: string): Document {
  const parser = new DOMParser()
  const doc = parser.parseFromString(xml, 'application/xml')

  // Check for parsing errors
  const parserError = doc.querySelector('parsererror')
  if (parserError) {
    throw new Error(`XML parsing error: ${parserError.textContent}`)
  }

  return doc
}

/**
 * Assert that XML document has the specified namespace
 */
export function assertXmlNamespace(doc: Document, namespace: string, prefix?: string): void {
  const root = doc.documentElement
  const attrName = prefix ? `xmlns:${prefix}` : 'xmlns'
  const actualNamespace = root.getAttribute(attrName)

  if (actualNamespace !== namespace) {
    throw new Error(
      `Expected namespace "${namespace}" for ${attrName}, got "${actualNamespace}"`
    )
  }
}

/**
 * Assert that XML element exists at the given XPath
 */
export function assertXmlElement(doc: Document, xpath: string): Element {
  // For XML with namespaces, we need special handling
  const parts = xpath.replace(/^\/\//, '').split('/')

  // Special case: if looking for root element directly, check documentElement
  if (parts.length === 1) {
    const tagName = parts[0].split('[')[0]
    if (doc.documentElement.tagName === tagName) {
      return doc.documentElement
    }
  }

  // Start from root and navigate through path
  let currentElements: HTMLCollectionOf<Element> | Element[] = [doc.documentElement]

  for (const part of parts) {
    // Extract tag name from namespace prefix (e.g., bpmn:definitions -> definitions)
    const tagName = part.includes(':') ? part.split(':')[0] + ':' + part.split(':')[1].split('[')[0] : part.split('[')[0]

    // Filter elements by tag name
    const matched: Element[] = []
    for (const el of currentElements) {
      const children = el.getElementsByTagName(tagName)
      for (let i = 0; i < children.length; i++) {
        matched.push(children[i] as Element)
      }
    }

    if (matched.length === 0) {
      throw new Error(`Element not found at XPath: ${xpath} (part: ${part}, tagName: ${tagName})`)
    }

    // Handle [1] predicate for first element
    if (part.includes('[1]')) {
      currentElements = [matched[0]]
    } else {
      currentElements = matched
    }
  }

  return currentElements[0] as Element
}

/**
 * Get elements matching XPath
 */
export function getXmlElements(doc: Document, xpath: string): Element[] {
  // For XML with namespaces, extract local tag name
  const parts = xpath.replace(/^\/\//, '').split('/')
  const lastPart = parts[parts.length - 1]
  const tagName = lastPart.includes(':') ? lastPart.split(':')[0] + ':' + lastPart.split(':')[1].split('[')[0] : lastPart.split('[')[0]

  // Get all elements with this tag name
  const allElements = doc.getElementsByTagName(tagName)

  // If path has multiple parts, filter to only those within parent path
  if (parts.length > 1) {
    const parentPath = parts.slice(0, -1).join('/')
    const result: Element[] = []

    for (let i = 0; i < allElements.length; i++) {
      const el = allElements[i] as Element
      // Check if this element has the correct ancestor
      if (hasAncestorMatchingPath(el, parentPath)) {
        result.push(el)
      }
    }
    return result
  }

  return Array.from(allElements)
}

/**
 * Helper to check if element has ancestor matching path
 */
function hasAncestorMatchingPath(element: Element, path: string): boolean {
  let current = element.parentElement
  const parts = path.replace(/^\/\//, '').split('/').reverse()

  for (const part of parts) {
    const tagName = part.includes(':') ? part.split(':')[0] + ':' + part.split(':')[1].split('[')[0] : part.split('[')[0]
    let found = false

    while (current) {
      if (current.tagName === tagName) {
        found = true
        current = current.parentElement
        break
      }
      current = current.parentElement
    }

    if (!found) return false
  }

  return true
}

/**
 * Convert simple XPath expressions to CSS selectors
 * This is a simplified converter for the BPMN XML structure
 */
function xpathToSelector(xpath: string): string {
  // Remove surrounding // and split by /
  const parts = xpath.replace(/^\/\//, '').split('/')

  const selectors: string[] = []

  for (const part of parts) {
    if (part.includes('@')) {
      // Attribute selector - skip for now, handle separately
      continue
    } else if (part.includes('[')) {
      // Predicate - handle [1] for first element
      const [tagName, predicate] = part.split('[')
      const baseTag = tagName.includes(':') ? tagName.split(':')[1] : tagName
      if (predicate === '1]') {
        selectors.push(`${baseTag}:first-of-type`)
      } else {
        selectors.push(baseTag)
      }
    } else {
      // Handle namespace prefix (e.g., bpmn:userTask -> userTask)
      const baseTag = part.includes(':') ? part.split(':')[1] : part
      selectors.push(baseTag)
    }
  }

  return selectors.join(' ')
}

/**
 * Normalize XML for comparison
 * Removes whitespace, sorts attributes, etc.
 */
export function normalizeXml(xml: string): string {
  return xml
    .replace(/>\s+</g, '><') // Remove whitespace between tags
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim()
}

/**
 * Compare two XML strings for equality
 */
export function assertXmlEqual(actual: string, expected: string): void {
  const normalizedActual = normalizeXml(actual)
  const normalizedExpected = normalizeXml(expected)

  if (normalizedActual !== normalizedExpected) {
    throw new Error(
      `XML mismatch:\nExpected: ${normalizedExpected}\nActual: ${normalizedActual}`
    )
  }
}

/**
 * Extract element content as text
 */
export function getElementText(doc: Document, xpath: string): string {
  const element = assertXmlElement(doc, xpath)
  return element.textContent || ''
}

/**
 * Get attribute value from element
 */
export function getElementAttribute(doc: Document, xpath: string, attrName: string): string | null {
  const element = assertXmlElement(doc, xpath)

  // Try direct getAttribute first (for non-namespaced attributes)
  const directValue = element.getAttribute(attrName)
  if (directValue !== null) {
    return directValue
  }

  // Handle namespaced attributes (e.g., flowable:assignee)
  if (attrName.includes(':')) {
    const [prefix, localName] = attrName.split(':')

    // Map common prefixes to their namespace URIs
    const namespaceMap: Record<string, string> = {
      flowable: 'http://flowable.org/bpmn',
      camunda: 'http://camunda.org/schema/1.0/bpmn',
      bpmn: 'http://www.omg.org/spec/BPMN/20100524/MODEL',
      bpmndi: 'http://www.omg.org/spec/BPMN/20100524/DI',
      dc: 'http://www.omg.org/spec/DD/20100524/DC',
      di: 'http://www.omg.org/spec/DD/20100524/DI',
      xsi: 'http://www.w3.org/2001/XMLSchema-instance'
    }

    const namespaceURI = namespaceMap[prefix]
    if (namespaceURI) {
      const nsValue = element.getAttributeNS(namespaceURI, localName)
      if (nsValue !== null) {
        return nsValue
      }
    }

    // Fallback: iterate through all attributes to find matching namespaced attribute
    if (element.attributes) {
      for (let i = 0; i < element.attributes.length; i++) {
        const attr = element.attributes[i]
        if (attr.name === attrName || attr.name.endsWith(':' + localName) || attr.localName === localName) {
          return attr.value
        }
      }
    }

    // For vendor-specific attributes (flowable, camunda), also look inside bpmn:extensionElements
    if (prefix === 'flowable' || prefix === 'camunda') {
      const extElements = element.getElementsByTagName('bpmn:extensionElements')
      if (extElements.length > 0) {
        const extElement = extElements[0]
        const vendorElements = extElement.getElementsByTagName(attrName)
        if (vendorElements.length > 0) {
          return vendorElements[0].textContent
        }
      }
    }
  }

  return null
}

/**
 * Count elements matching XPath
 */
export function countElements(doc: Document, xpath: string): number {
  return getXmlElements(doc, xpath).length
}

/**
 * Validate BPMN namespaces exist
 */
export function assertBpmnNamespaces(doc: Document): void {
  assertXmlNamespace(doc, 'http://www.omg.org/spec/BPMN/20100524/MODEL', 'bpmn')
  assertXmlNamespace(doc, 'http://www.omg.org/spec/BPMN/20100524/DI', 'bpmndi')
  assertXmlNamespace(doc, 'http://www.omg.org/spec/DD/20100524/DC', 'dc')
  assertXmlNamespace(doc, 'http://www.omg.org/spec/DD/20100524/DI', 'di')
}
