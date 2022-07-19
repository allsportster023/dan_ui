function inStr(start, string1, string2) {

   let retval = string1.substring(start).search(string2)
   if (retval != -1) retval = retval + start
   return retval

}

function mid(string1, start, len) {

   return string1.substr(start, len)

}

function mid(string1, start) {

   return string1.toString().substring(start, string1.length)

}

function left(string1, len) {

   return string1.substr(0, len)

}

function right(string1, len) {

   return mid(string1, string1.length - len)

}

function printObject(o) {

   var out = "{\n"
   for (var p in o) {
      out += "   " + p + ": " + o[p] + "\n"
   }
   out = out + "}"
   console.log(out)

}

module.exports = {inStr, mid, left, right, printObject}