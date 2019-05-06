export default class StringUtils {
  // FIXME - test all this
  
  static isNumberString(str:string):boolean {
    // I think this is the actual JavaScript definition
    return String(parseInt(str)) == str
  }
  
  static isJSIdentifier(str:string):boolean {
    if (str.length == 0) {
      return false
    }
    if (!StringUtils.isJSIdentifierStartChar(str[0])) {
      return false
    }
    for(let i = 0; i < str.length; i++) {
      if (!StringUtils.isJSIdentifierPartChar(str[i])) {
        return false
      }
    }
    return true
  }
  
  static isJSIdentifierStartChar(ch:string):boolean {
    return StringUtils.isLetter(ch) || ch == '$' || ch == '_'
  }

  static isJSIdentifierPartChar(ch:string):boolean {
    return StringUtils.isJSIdentifierStartChar(ch) || StringUtils.isDigit(ch)
  }

  static isLetter(ch:string):boolean {
    return (ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z')
  }

  static isDigit(ch:string):boolean {
    return ch >= '0' && ch <= '9'
  }

  static escapeToJSString(str:string):string {
    let ret = ""
    for(const ch of str) {
      switch(ch) {
      case "\n":
        ret += "\\n"
        break;
      case "\t":
        ret += "\\t"
        break;
      case "\r":
        ret += "\\r"
        break;
      case "\b":
        ret += "\\b"
        break;
      case "\v":
        ret += "\\v"
        break;
      case "\\":
        ret += "\\\\"
        break;
      case "\'":
        ret += "\\\'"
        break;
      case "\"":
        ret += "\\\""
        break;
      default:
        const cc = ch.charCodeAt(0)
        if (cc < 32 || cc >= 127) {
          const ccs = `0000${cc.toString(16)}`
          ret += `\\u${ccs.substring(ccs.length - 4)}`
        }
        else {
          ret += ch
        }
      }
    }
    return ret
  }
}
