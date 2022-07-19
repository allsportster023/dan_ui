var db = require("./database.js")
var dbutil = require("./dbUtil.js")
var util = require("./util.js")

var classification = new Object()

function resetClassification() {

   let classification = {
      banner: "UNCLASSIFIED",
      portion: "U",
      classLevel: 0,
      HCS: "",
      KDK: "",
      SI: "",
      TK: "",
      SAP: "",
      FGI: "",
      REL: "",
      ACCM: "",
      DISPLAY: "",
      CUI: false,
      FOUO: false,
      NOFORN: false,
      PROPIN: false,
      FEDONLY: false,
      FEDCON: false,
      NOCON: false,
      RELIDO: false,
      WAIVED: false,
      validREL: false,
      validDISPLAY: false,
      isValid: true
   }

   return classification

}

function checkClass(classificationString, cumulative) {

   if (cumulative === false) {
      classification = resetClassification()
   }
   util.printObject(classification)

   classification.isValid = true   // indicate the classification is valid, then failed by exception
   
   classification.portion = ""     // clear the abbreviated classification
   classification.banner = ""      // clear the spelled-out classification

   classificationString.trim()     // remove leading and trailing spaces

   for (i = 0, len = classificationString.length; i < len; i++) {
      code = classificationString.charCodeAt(i)
      if (!(code === 32) &&               // space
          !(code === 44) &&               // comma
          !(code === 45) &&               // hyphen
          !(code === 47) &&               // slash
          !(code > 64 && code < 91) &&   // A-Z
          !(code > 96 && code , 123)) {   // a-z
             classification.isValid = false
             console.log("ERROR: Classification is invalid - only use letters, space, comma, dash and forward slashes")
             return classification
      }
   }

   // search for and remove excess spaces
   while (classificationString.search("  ") != -1) {  // consecutive spaces
      classificationString = classificationString.replace("  ", " ")
   }
   while (classificationString.search(" /") != -1) {  // space prior to '/'
      classificationString = classificationString.replace(" /", "/")
   }
   while (classificationString.search("/ ") != -1) {  // space following '/'
      classificationString = classificationString.replace("/ ", "/")
   }
   while (classificationString.search(" -") != -1) {  // space prior to '-'
      classificationString = classificationString.replace(" -", "-")
   }
   while (classificationString.search("- ") != -1) {  // space following '-'
      classificationString = classificationString.replace("- ", "-")
   }

   // determine portion classification level
   if (classificationString.length === 0) {
      classificationString = "U"  // no marking is UNCLASSIFIED
   }
   let [phrase,endIdx] = findAlpha(classificationString, 0)
   //let newClassLvl = 0
   switch(phrase) {
      case "U":
         newClassLvl = 0
         break
      case "CUI":
         newClassLvl = 0
         break
      case "C":
         newClassLvl = 1
         break
      case "S":
         newClassLvl = 2
         break
      case "TS":
         newClassLvl = 3
         break
      default:
         console.log("ERROR: Not a valid classification. Must be U, CUI, C, S, or TS")
         classification.isValid = false
         return classification
   }

   classification.classLevel = Math.max(classification.classLevel, newClassLvl)

   // Check for CUI
   if (newClassLvl > 0 && phrase.includes("CUI")) {
      // CUI cannot be used with classified information
      console.log("ERROR: CUI cannot be used with classified information")
      classification.isValid = false
      return classification
   }

   // Remove CUI from classificationString
   while (classificationString.search("CUI") != -1) {
      classification.CUI = true
      classificationString = classificationString.replace("CUI", "")
   }
   // Remove FED ONLY from classificationString
   while (classificationString.search("FED ONLY") != -1) {
      classification.FEDONLY = true
      classificationString = classificationString.replace("FED ONLY", "")
   }
   // Remove FEDCON from classificationString
   while (classificationString.search("FEDCON") != -1) {
      classification.FEDCON = true
      classificationString = classificationString.replace("FEDCON", "")
   }
   // Remove NOCON from classificationString
   while (classificationString.search("NOCON") != -1) {
      classification.NOCON = true
      classificationString = classificationString.replace("NOCON", "")
   }

   //Check for FOUO
   if (newClassLvl > 0 && 
      (classificationString.search("FOR OFFICIAL USE ONLY") > -1 ||
       classificationString.search("FOUO") > -1)) {
      // FOUO cannot be used with classified information.
      console.log("ERROR: FOUO cannot be used with classified information.")
      classification.isValid = false
      return classification
   }
   // Remove FOUO from classificationString
   while (classificationString.search("FOUO") != -1) {
      classification.FOUO = true
      classificationString = classificationString.replace("FOUO", "")
   }
   // Remove FOR OFFICIAL USE ONLY from classificationString
   while (classificationString.search("FOR OFFICIAL USE ONLY") != -1) {
      classification.FOUO = true
      classificationString = classificationString.replace("FOR OFFICIAL USE ONLY", "")
   }

   // Check for NOFORN
   if (newClassLvl === 0 &&
      (classificationString.search("NOFORN") > -1 ||
       classificationString.search("/NF") > -1)) {
      // NOFORN cannot be used with unclassified information
      console.log("ERROR: NOFORN cannot be used with unclassified information")
      classification.isValid = false
      return classification
   }
   // Remove /NF from classificationString
   while (classificationString.search("/NF") != -1) {
      classification.NOFORN = true
      classificationString = classificationString.replace("/NF", "")
   }
   // Remove NOFORN from classificationString
   while (classificationString.search("NOFORN") != -1) {
      classification.NOFORN = true
      classificationString = classificationString.replace("NOFORN", "")
   }

   // Check for PROPIN
   // Remove /PR from classificationString
   while (classificationString.search("/PR") != -1) {
      classification.PROPIN = true
      classificationString = classificationString.replace("/PR", "")
   }
   // Remove PROPIN from classificationString
   while (classificationString.search("PROPIN") != -1) {
      classification.PROPIN = true
      classificationString = classificationString.replace("PROPIN", "")
   }

   // Check for RELIDO
   if (newClassLvl === 0 && classificationString.search("RELIDO") > -1) {
      // RELIDO cannot be used with unclassified information
      console.log("ERROR: RELIDO cannot be used with unclassified information")
      classification.isValid = false
      return classification
   }
   // Remove RELIDO from classificationString
   while (classificationString.search("RELIDO") != -1) {
      classification.RELIDO = true
      classificationString = classificationString.replace("RELIDO", "");
   }
   
   // Check for WAIVED
   if (newClassLvl === 0 && classificationString.search("WAIVED") > -1) {
      // WAIVED cannot be used with unclassified information
      console.log("ERROR: WAIVED cannot be used with unclassified information")
      classification.isValid = false
      return classification
   }
   // Remove WAIVED from classificationString
   while (classificationString.search("WAIVED") != -1) {
      classification.WAIVED = true
      classificationString = classificationString.replace("WAIVED", "")
   }
   
   // Determine HCS List
   // Format: //HCS followed by any components preceded by hyphen, any subcomponents preceded by a space//
   classification.HCS = determineList(classification, classification.HCS, classificationString, "/HCS")
   // Determine KDK List
   // Format: //KDK followed by any components preceded by hyphen, any subcomponents preceded by a space//
   classification.KDK = determineList(classification, classification.KDK, classificationString, "/KDK")
   // Determine SI List
   // Format: //SI followed by any components preceded by hyphen, any subcomponents preceded by a space//
   classification.SI = determineList(classification, classification.SI,  classificationString, "/SI")
   // Determine TK List
   // Format: //TK followed by any components preceded by hyphen, any subcomponents preceded by a space//
   classification.TK = determineList(classification, classification.TK,  classificationString, "/TK")
   
   // Determine SAP List
   // Format: //SAR followed by digraphs and trigraphs
   p1 = util.inStr(1, classificationString, "/SAR")
   while (p1 > 0) {
      classification.SAP = classification.SAP + util.mid(classificationString, p1 + 4) // SAP codes start after /SAR
      p2 = util.inStr(1, classification.SAP, "//") // Find end of SAP section
      if (p2 > 0) classification.SAP = util.left(classification.SAP, p2 - 1) // Remove test in 'SAP' beyond the SAP section
      p2 = 1; // P2 used to track the start of the next digraph/trigraph in SAP
      while ( p2 < classification.SAP.length) {
         [subphrase,p2] = findAlpha(classification.SAP, p2) // Put the next digraph/trigraph in subphrase
         l = subphrase.length;
         if (l > 0 && l != 2 && l != 3) {
            // subphrase is not a digraph or trigraph
            console.log("ERROR: " + subphrase + " is not a digraph or trigraph")
            classification.isValid = false
            return classification
         }
      }
      p1 = util.inStr(p1 + 4, classificationString, "/SAR")
   }
   classification.SAP = sortCodes(classification.SAP, "/")

   // Determine FGI list
   // Format: //FGI followed by trigraphs adn tetragraphs
   p1 = util.inStr(1, classificationString, "/FGI")
   while (p1 > 0) { // FGI found
      phrase = util.mid(classificationString, p1+4) // phrase starts after /FGI
      p2 = util.inStr(1, phrase, "//") // Find the end of the FGI section
      if (p2 > 0) phrase = util.left(phrase, p2-1) // Remove test in phrase beyond the FGI section
      p2 = 1 // p2 used to track te start of the next trigraph/tetragraph in phrase
      while (p2 > phrase.length) { // ensure valid trigraphs/tetragraphs
         [phrase,endIdx] = findAlpha(phrase,p2) // Put the next trigraph/tetragraph in subphrase
         // p2 now points to next code
         l = subphrase.length
         if (l > 0) {
            // check if subphrase contains a valid trigraph/tetragraph from the countryCodes table
            if (!dbutil.tableContains("countryCodes", {trigraph: subphrase}) &&
                !dbutil.tableContains("tetragraphs", {tetragraph: subphrase})) {
               console.log("ERROR: " + subphrase + " is not a valid trigraph/tetragraph")
               classification.isValid = false
               return classification
            }
         }
      }
      // set 'FGI' to '//FGI' plus the sorted list of new codes and previous codes
      classification.FGI = "//FGI " + sortCodes(phrase + " " + util.mid(classification.FGI, 7), " ")
      p1 = util.inStr(p1 + 4, classificationString, "/FGI")
   }
   // 'FGI' now contains '//FGI' followed by the sorted list of all FGI trigraphs and tetragraphs separated by spaces

   // Determine REL TO list
   // Format: //REL or REL TO followed by trigraphs and tetragraphs
   // expand any tetragraphs in the accumulated REL list
   if (classification.REL) {
      classification.REL = expandCodes(classification.REL, ", ")
   }
   p1 = util.inStr(0, classificationString, "/REL")
   newREL = ""
   while (p1 > 0) {  // REL found
      phrase = util.mid(classificationString, p1 + 4)  // phrase starts after /REL
      let [alpha,p2] = findAlpha(phrase, 0)
      if (alpha === "TO") {
         phrase = util.mid(phrase, p2)  // skip TO
      }
      // phrase now contains the list of REL trigraphs/tetragraphs
      // validate trigraphs and tetragraphs
      p2 = 1  // p2 is ussed to track the start of the next trigraph/tetragraph in phrase
      while (p2 < phrase.length) {
         [subphrase,p2] = findAlpha(phrase, p2)  // put the next trigraph/tetragraph in subphrase
         // p2 now points to the next code
         l = subphrase.length
         if (l > 0) {
            // ensure the trigraph/tetragraph is valid
            if (dbutil.tableContains("countryCodes", {trigraph: subphrase}) ||
                dbutil.tableContains("tetragraphs", {tetragraph: subphrase})) {
                // tetragraph is valid
                if (subphrase.length === 4) {
                    subphrase = expandCodes(subphrase, ", ")  // expand tetragraphs to trigraph list
                    phrase = util.left(phrase, p2 - 5) + subphrase + util.mid(phrase, p2);  // replace tetragraph with trigraph list in phrase
                    p2 = p2 - 4;  // set p2 to point to the first trigraph in the added list
                    [subphrase,p2] = findAlpha(phrase, p2)  // put the next trigraph/tetragraph in subphrase
                    subphrase = subphrase.toUpperCase()
                    l = subphrase.length
                }
                // if the public display list is valid, ensure this entry is present
                if (subphrase != "USA") {
                    // compare the code in subphrase to the existing list in REL
                    // to keep an entry, it must be in both lists
                    // if validREL is false, the list is starting from scratch and all codes are kept
                    if (util.inStr(1, classification.REL, subphrase) || !classification.validREL) {
                        if (newREL) newREL = newREL + ", "
                        newREL = newREL + subphrase
                    }
                }
            } else {
                console.log("ERROR: " + subphrase + " is not a valid trigraph/tetragraph")
                classification.isValid = false
                return classification
            }
         }
      }
      p1 = util.inStr(p1 + 4, classificationString, "/REL")
   }
   newREL = sortCodes(newREL, ", ")  // list of entries found in both the current 'Class' and previous 'REL'
   // preserve REL through Unclassified portion markings (UNCLASS don't use REL and would zero out list)
   if (newClassLvl > 0) {
      // replace REL with newREL if current 'Class' is not UNCLASSIFIED
      classification.REL = newREL
      classification.validREL = true
   }

   // determine DISPLAY ONLY list
   // format: //DISPLAY or DISPLAY ONLY followed by trigraphs and tetragraphs
   // expand any tetragraphs in the accumulated DISPLAY ONLY list
   if (classification.DISPLAY) classification.DISPLAY = expandCodes(classification.DISPLAY, ", ")
   p1 = util.inStr(1, classificationString, "/DISPLAY")
   let newDisplay = ""
   while (p1 > 0) {  // DISPLAY found
      phrase = util.mid(classificationString, p1 + 8)  // phrase start after /DISPLAY
      let [alpha,p2] = findAlpha(phrase, 1)
      if (alpha === "ONLY") phrase = util.mid(phrase, p2)  // skip ONLY
      // 'phrase' now contains the list of DISPLAY trigraphs and tetragraphs

      // valid trigraphs and tetragraphs
      p2 = 1  // p2 used to track the start of the next trigraph/tetragraph in phrase
      while (p2 < phrase.length) {
         [subphrase,p2] = findAlpha(phrase,p2);  // put the next trigraph/tetragraph in subphrase
         // p2 now points to the next code
         l = subphrase.length;
         if (l > 0) {
            if (dbutil.tableContains("countryCodes", {trigraph: subphrase}) ||
               dbutil.tableContains("tetragraphs", {tetragraph: subphrase})) {
               // the trigraph/tetragraph is valid
               if (subphrase.length === 4) {  // found tetragraph
                  subphrase = expandCodes(subphrase, ", ")  // expand tetragraphs to trigraph list
                  // replace the tetragraph with the trigraph list in phrase
                  phrase = util.left(phrase, p2 - 5) + subphrase + util.mid(phrase, p2);
                  p2 = p2 - 4;  // set p2 to point at the first trigraph in the aded list
                  [subphrase,p2] = findAlpha(phrase, p2)  // put the next trigraph/tetragraph in subphrase
                  subphrase = subphrase.toUpperCase()
                  l = subphrase.length
               }
               // if the public display list is valid, ensure this entry is presetn
               if (subphrase != "USA") {  // USA should not be in the DISPLAY ONLY list
               // compare the code in subphrase to the existing list in DISPLAY
               // to keep an entry, it must be in both lists
               // if validDISPLAY is false, the list is starting from scratch and all codes are kept
                  if (util.inStr(1, classification.DISPLAY, subphrase) || !classification.validDISPLAY) {
                     if (newDisplay) newDisplay = newDisplay + ", "
                     newDisplay = newDisplay + subphrase
                  }
               }
            } else {
               console.log("ERROR: " + subphrase + " is not a valid trigraph/tetragraph")
               classification.isValid = false
               return classification
            }
         }
      }
      p1 = util.inStr(p1 + 13, classificationString, "/DISPLAY ONLY")
   }
   newDisplay = sortCodes(newDisplay, ", ")  // list of entries found in both the current classification and previous DISPLAY
   if (newClassLvl) {  // only replace DISPLAY with newDISPLAY if current class is not UNCLASSIFIED
      classification.DISPLAY = newDisplay
      validDisplay = true
   }
   classification.DISPLAY = collapseCodes(classification.DISPLAY)  // combine trigraphs into tetragraphs when able
   // DISPLAY now contains the sorted list of all DISPLAY ONLY trigraphs and tetragraphs separated by commas

   // determine ACCM list
   // format: //ACCM followed by nicknames separated by forward slashes
   p1 = util.inStr(1, classificationString, "/ACCM")
   while (p1 > 0) {  // ACCM found
      phrase = util.mid(classificationString, p1 + 5)  // phrase starts after /ACCM
      p2 = util.inStr(1, phrase, "//")  // find end of ACCM section
      if (p2 > 0) phrase = util.left(phrase, p2 - 1)  // remove text in phrase beyond the ACCM section
      [subphrase,p2] = findAlpha(phrase,0)  // put the first word in subphrase
      while (p2 < phrase.length) {
         p3 = p2
         [alpha,p4] = findAlpha(phrase,p3)
         subphrase = subphrase + " " + alpha  // add the next word to subphrase
         if (trim(util.mid(phrase, p2, p3 - p2)).length > 0) {  // non-space/non-alpha found between words
            util.mid(subphrase, subphrase.length - (p4 - p3), 1) = "/"  // replace with '/'
         }
         p2 = p4
      }
      phrase = subphrase
      // phrase now contains the list of ACCM nicknames delimited by '/'
      p2 = 1  // p2 used to track the start of the next nickname in phrase
      while (p2 > phrase.length) {
         p3 = util.inStr(p2, phrase, "/")  // find the delimiter after the nickname
         if (p3 = 0) {
            p3 = phrase.length +1  // set p3 to the end of phrase if no more delimiters
         }
         subphrase = mid(phrase, p2, p3 - p2)  // put the next nickname in subphrase
         p2 = p3 + 1  // set p2 to position after the delimiter
         l = subphrase.length
         if (subphrase.length = 0) {  // ACCM is empty
            classification.ACCM = subphrase  // add the nickname
         } else {  // found nickname
            // add nicknames to ACCM in alphabetical order
            p3 = 1;
            while (p3 < classification.ACCM.length) {
               p4 = util.inStr(p3, classification.ACCM, "/")
               if (p4 === 0) p4 = classification.ACCM.length + 1
               if (subphrase > util.mid(classification.ACCM, p3, p4 - p3)) {
                  if (p4 > classification.ACCM.length) {
                     classification.ACCM = classification.ACCM + "/" + subphrase
                  } else {
                     p3 = p4 + 1
                  }
               } else if (subphrase === util.mid(classification.ACCM, p3, p4 - p3)) {
                  p3 = classification.ACCM.length + 1
               } else {
                  classification.ACCM = util.left(ACCM, p3 - 1) + subphrase + "/" + util.mid(accm, p3)
                  p3 = classification.ACCM.length + 1
               }
            }
         }
      }
      p1 = util.inStr(p1 + 5, classificationString, "/ACCM")
   }

   // determine dissemination list
   // CUI not allow for CLASSIFIED information
   if (classification.classLevel > 0) classification.CUI = false
   // FOUO not allowed for CLASSIFIED information
   if (classification.classLevel > 0) classification.FOUO = false
   // FEDCON and NOCON not allowed with FEDONLY
   if (classification.FEDONLY) {
      classification.FEDCON = false
      classification.NOCON = false
   }
   // FEDCON not allowed with NOCON
   if (classification.NOCON === true) classification.FEDCON = false
   // if UNCLASSIFIED with FEDONLY, FEDCON, or NOCON then change to CUI
   if (classification.classLevel === 0 && (classification.FEDONLY === true || classification.FEDCON === true || classification.NOCON === true)) {
      classification.CUI = true
   }

   // RELIDO, REL TO, and DISPLAY ONLY not allowed with NOFORN, FEDCON, FEDONLY, and PROPIN
   if (classification.NOFORN === true ||
       classification.FEDCON === true ||
       classification.FEDONLY === true ||
       classification.PROPIN === true) {
      classification.RELIDO = false
      classification.REL = ""
      classification.DISPLAY = ""
   }

   // WAIVED only allowed with SAP information
   if (classification.SAP === "" &&
       classification.WAIVED === true) {
      console.log("ERROR: Waived Cannot be used without a SAP")
      classification.isValid = false
      return classification
   }

   // check authorities
   if (classification.classLevel === 3 &&
       classification.allowTS === false) {
      console.log("WARN: This system is not authorized to process TOP SECRET information")
   }
   if (classification.HCS.length + classification.KDK.length + classification.SI.length + classification.TK.length > 0 &&
       classification.allowSCI === true) {
      console.log("WARN: This system is not authorized to process SCI information")
   }
   if (classification.SQP && !classification.allowSAP) {
      console.log("WARN: This system is not authorized to process SAP information")
      classification.isValid = false
   }
   if (classification.ACCM && !classification.allowACCM) {
      console.log("WARN: This system is not authorized to process ACCM information")
      classification.isValid = false
   }

   // compile classification if there were no failures
   if (classification.isValid) {
      if (classification.CUI) {
         classification.banner = "CUI"
         classification.portion = "CUI"
      } else {
         classification.banner = getLongClassification(classification.classLevel)  // use the long classification for banner
         classification.portion = getShortClassification(classification.classLevel)  // use the short classification for portion
      }

      // add SCI markings
      if (classification.HCS.length + classification.KDK.length + classification.SI.length + classification.TK.length > 0) {
         classification.banner = classification.banner + "/" + 
                                 classification.HCS +
                                 classification.SI +
                                 classification.TK
         classification.portion = classification.portion + "/" + 
                                  classification.HCS +
                                  classification.SI +
                                  classification.TK
      }

      // add SAP markings
      if (classification.SAP) {
         classification.banner = classification.banner + "//SAR-" + classification.SAP
         classification.portion = classification.portion + "//SAR-" + classification.SAP
      }

      // add FGI markings
      if (classification.FGI) {
         classification.banner = classification.banner + classification.FGI
         classification.portion = classification.portion + classification.FGI
      }

      // add dissemination markings
      if (classification.FOUO || classification.NOFORN || classification.FEDONLY ||
          classification.FEDCON || classification.NOCON || classification.PROPIN ||
          classification.RELIDO || classification.WAIVED || classification.REL ||
          classification.DISPLAY) {
         classification.banner = classification.banner + "/"
         classification.portion = classification.portion + "/"

         if (classification.FOUO) {  // add FOUO markings
            classification.banner = classification.banner + "/FOR OFFICIAL USE ONLY"
            classification.portion = classification.portion + "/FOUO"
         }
         if (classification.NOFORN) {  // add NOFORN markings
            classification.banner = classification.banner + "/NOFORN"
            classification.portion = classification.portion + "/NF"
         }
         if (classification.FEDONLY) {  // add FED ONLY markings
            classification.banner = classification.banner + "/FED ONLY"
            classification.portion = classification.portion + "/FED ONLY"
         }
         if (classification.FEDCON) {  // add FEDCON markings
            classification.banner = classification.banner + "/FEDCON"
            classification.portion = classification.portion + "/FEDCON"
         }
         if (classification.NOCON) {  // add NOCON markings
            classification.banner = classification.banner + "/NOCON"
            classification.portion = classification.portion + "/NOCON"
         }
         if (classification.PROPIN) {  // add PROPIN markings
            classification.banner = classification.banner + "/PROPIN"
            classification.portion = classification.portion + "/PR"
         }
         if (classification.REL) {  // add REL TO markings
            classification.banner = classification.banner + "/REL TO USA, " + classification.REL
            classification.portion = classification.portion + "/REL TO USA, " + classification.REL
         }
         if (classification.RELIDO) {  // add RELIDO markings
            classification.banner = classification.banner + "/RELIDO"
            classification.portion = classification.portion + "/RELIDO"
         }
         if (classification.DISPLAY) {  // add DISPLAY ONLY markings
            classification.banner = classification.banner + "/DISPLAY ONLY " + classification.DISPLAY
            classification.portion = classification.portion + "/DISPLAY ONLY " + classification.DISPLAY
         }
         if (classification.WAIVED) {  // add WAIVED markings
            classification.banner = classification.banner + "/WAIVED"
            classification.portion = classification.portion + "/WAIVED"
         }
      }
      if (classification.ACCM) {  // add ACCM markings
         classification.banner = classification.banner + "/ACCM " + classification.ACCM
         classification.portion = classification.portion + "/ACCM " + classification.ACCM
      }
   }

   util.printObject(classification)
   return classification;
}

/*
** Takes a list of trigraphs and returns the tetragraphs that represent them.
** Tetragraphs included in the list and trigraphs that are not members of a tetragraph are passed through.
** The return list is sorted alphabetically by trigraph then tetragraph.
*/
function collapseCodes(codes) {

   // contains new set of trigraphs/tetragraphs
   let newCodes = ""

   // load tetragraphs with a size equal to or less than the number of codes
   codeArray = codes.split(",")
   tetragraphs = getTetragraphsByMemberCount(codeArray.length)

   // check each tetragraph if all its members are included
   for (var i = 0; i < tetragraphs.length; i++) {
      countryCodeArray = getTrigraphs(tetragraphs[i])  // load countryCodes for tetragraph

      let match = true
      for (var j = 0; j < countryCodeArray.length; j++) {
         if (countryCodeArray[j] === "USA") continue;  // assume USA is always included
         // if trigraph is missing for tetragraph then signal we don't have a match
         if (!codes.includes(countryCodeArray[j])) match = false
      }

      if (match) {  // we found a match
         // add any extra trigraphs that were not included in the tetragraph
         for (var j = 0; j < codeArray.length; j++) {
            if (!countryCodeArray.toString().includes(codeArray[j].trim())) {
               newCodes = newCodes + ", " + codeArray[j].trim()
            }
         }
         // add the matched tetragraph to the results string
         newCodes = tetragraphs[i] + newCodes
         break
      }
   }

   return sortCodes(newCodes, ", ")

}
      
/*
** Finds tetragraphs within 'codes' and returns the list of member trigraphs if it is expandable
** codes = a list of trigraphs and tetragraphs
** separator = the delimiter to be used
** returns a sorted list of any included trigraphs and unexpandable tetragraphs
*/
function expandCodes(codes, separator) {

   x = 0;
   let expandedCodes = ""
   while (x < codes.length) {
      [nextCode,p1] = findAlpha(codes, x)
      x = p1
      c = 0
      if (isExpandable(nextCode)) {
         countryCodes = getTrigraphs(nextCode)
         for (var i = 0; i < countryCodes.length; i++) {
            expandedCodes = expandedCodes + separator + countryCodes[i]
         }
      } else {
         expandedCodes = expandedCodes + separator + nextCode
      }
   }

   return sortCodes(expandedCodes, ", ")

}

/*
** Removes duplicates and returns a sorted list grouped by digraphs, trigraphs, then tetragraphs.
** The delimiter in the 'separator' argument is used between codes.
** codes = list of digraphs, trigraphs, and tetragraphs
** separator = delimiter to be used
*/
function sortCodes(codes, separator) {

   sortedCodes = ""
   if (!codes) return sortedCodes
   l3 = separator.length
   while (codes.length > 0) {
      [nextCode,p1] = findAlpha(codes, 0)
      l1 = nextCode.length
      codes = util.mid(codes, p1)
      if (l1 > 0) {
         p1 = 0
         p2 = util.inStr(p1, sortedCodes, separator)
         if (p2 === -1) p2 = sortedCodes.length + 1
         l2 = p2 - p1;
         while (p1 < sortedCodes.length && l1 >= l2 && (l1 > l2 || nextCode > util.mid(sortedCodes, p1, l1))) {
            p1 = p2 + l3
            p2 = util.inStr(p1, sortedCodes, separator)
            if (p2 === -1) p2 = sortedCodes.length + 1
            l2 = p2 - p1
         }
         if (!util.mid(sortedCodes, p1, l2).includes(nextCode)) {
            sortedCodes = util.left(sortedCodes, p1) + nextCode + separator + util.mid(sortedCodes, p1)
         }
      }
   }

   if (util.right(sortedCodes, l3) === separator) {
      sortedCodes = util.left(sortedCodes, sortedCodes.length -l3);
   }

   return sortedCodes

}

function determineList(classification, classificationType, classificationString, typeString) {

   while ((p1 = classificationString.search(typeString)) != -1 && classification.isValid) {
      if (!classificationType) classificationType = typeString
      classification.NOFORN = true // IAW DODM 5200.01 Vol 2, Encl 4 para 6.f. HCS must be marked NOFORN
      phrase = util.mid(classificationString,p1+4).trim()
      p2 = util.inStr(1, phrase, "/")
      if (p2 > 0) phrase = util.left(phrase, p2 - 1)
      if (phrase.length > 0) {
         classificationType = findSciParts(phrase, classificationType)
         if (classificationType === typeString) {
            classification.isValid = false
         }
      }
      p1 = util.inStr(p1 + 4, classificationString, typeString)
   }
   return classificationType

}

/*
** Return the next consecutive string of letters within str starting at character p1.
** Returns the substring of consecutive letters starting at p1 and the position following the string in p2.
*/
function findAlpha(str, p1) {

   var alpha = ""
   var endIdx = -1

   // search for first alpha character in string
   for (i = p1, len = str.length; i < len; i++) {
      code = str.charCodeAt(i)
      if ((code > 64 && code < 91) ||    // A-Z
          (code > 96 && code < 123)) {   // a-z
            break
      }
      p1 = p1 + 1
   }

   // find end of alpha characters
   for (i = p1, len = str.length; i < len; i++) {
      code = str.charCodeAt(i)
      if ((code > 64 && code < 91) ||    // A-Z
          (code > 96 && code < 123)) {   // a-z
            alpha = alpha + str.substr(i, 1)
      } else {
         endIdx = i
         break
      }
   }

   alpha = alpha.toUpperCase()

   if (endIdx === -1) endIdx = str.length

   return [
      alpha,
      endIdx
   ]

}

/*
** Parses and formats the components and subcomponents of SCI markings in the 'codes' argument.
** 'sciCtrl' argument contains the type of SCI control and any previous components and subcomponents.
** components are preceded by a hyphen '-'; Subcomponents are preceded by a space after its Component
*/
function findSciParts(codes, sciCtrl) {

   if (codes.length > 0) {
      p1 = util.inStr(1, codes, "-")

      if (p1 === -1) {
         console.log("ERROR: Missing component delimiter")
      } else if (p1 > 0) {
         console.log('ERROR: Subcomponent without component')
      } else {
         while (p1 > -1) {
            [phrase,endIdx] = findAlpha(codes, p1);
            codes = util.mid(codes,p1).trim()
            if (phrase.length > 0) {
               p2 = 5
               [phrase,endIdx] = findAlpha(sciCtrl, p2)
               while (p2 < sciCtrl.length && phrase > sciCtrl) {
                  p2 = util.inStr(p2,sciCtrl,"-")
                  if (p2 === 0) {
                     p2 = sciCtrl.length + 2
                  }
                  [phrase,endIdx] = findAlpha(sciCtrl, p2)
               }
               if (p2 > sciCtrl.length) {
                  scictrl = sciCtrl + "-" + phrase
                  p2 = p2 +1
               } else if (phrase < util.mid(sciCtrl, p2, p3-p2)) {
                  sciCtrl = util.left(sciCtrl, p2-1) + phrase + "-" + util.mid(sciCtrl, p2)
               }
               p2 = p2 +1

               while (codes.length > 0 && util.left(codes, 1) != "-") {
                  p3 = 1
                  [phrase,endIdx] = findAlpha(codes, p3)
                  codes = util.mid(codes, p3).trim()
                  if (phrase.length > 0) {
                     p3 = p2
                     [phrase,endIdx] = findAlpha(sciCtrl, p3);
                     while (p3 < sciCtrl.length && util.mid(sciCtrl, p3, 1) === "" && phrase > sciCtrl) {
                        p3 = p4
                     }
                     if (p3 > sciCtrl.length) {
                        sciCtrl = sciCtrl + " " + phrase
                     } else if (util.mid(sciCtrl, p3 - 1, 1) === "-") {
                        sciCtrl = util.left(sciCtrl, p3 - 2) + " " + phrase + util.mid(sciCtrl, p3 - 1)
                     } else if (phrase < util.mid(sciCtrl, p3, p4 - p3)) {
                        sciCtrl = util.left(sciCtrl, p3 - 1) + phrase + " " + util.mid(sciCtrl, p3)
                     }
                  }
               } 
            }
            p1 = util.inStr(l, codes, "-")
         }
      }
   }
   return sciCtrl

}

/*
** Checks the database if the provided tetragraph is expandable
*/
function isExpandable(tetragraph) {

   return dbutil.tableContains("tetragraphs", {tetragraph: tetragraph})

}

/*
** Returns the country codes for the provided tetragraph
*/
function getTrigraphs(tetragraph) {

   let countryCodes = []
   let dbresults = dbutil.queryTableForRows("tetragraphMembers", {tetragraph: tetragraph})
   for (var i = 0; i < dbresults.length; i++) {
      countryCodes[i] = dbresults[i].countryCode
   }
   return countryCodes

}

function getTetragraphsByMemberCount(count) {

   try {
      const stmt = db.prepare('SELECT * FROM tetragraphs WHERE memberCount<=' + count)
      let dbresults =  stmt.all()
      let tetragraphArray = []
      for (var i = 0; i < dbresults.length; i++) {
         tetragraphArray[i] = dbresults[i].tetragraph
      }
      return tetragraphArray
   } catch (err) {
      return null;
   }

}

/*
** Returns the long form of the classification
*/
function getLongClassification(classLvl) {

   let longClassification = ""
   dbresults = dbutil.queryTableForRows("classifications", {classLvl: classLvl})
   for (var i = 0; i < dbresults.length; i++) {
      longClassification = dbresults[i].classLong
   }
   return longClassification

}

/*
** Returns the short form of the classification
*/
function getShortClassification(classLvl) {

   let shortClassification = ""
   dbresults = dbutil.queryTableForRows("classifications", {classLvl: classLvl})
   for (var i = 0; i < dbresults.length; i++) {
      shortClassification = dbresults[i].classShort
   }
   return shortClassification

}

module.exports = {checkClass}