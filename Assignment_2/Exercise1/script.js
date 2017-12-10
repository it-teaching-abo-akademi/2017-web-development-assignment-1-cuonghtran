$(document).ready(function() {
	$("#btnDecode").click(function(){
		// clear all fields
		refreshFields();
		let barCode = $("#barCodeText").val();
		if(barCode !== "") {
			let elements = barCodeBreakDown(barCode);
			if (elements !== null) {
				// add space every 4 characters to IBAN text
				let finalIban = elements["iban"].substring(0, 2) + " " + addCharacterEveryStep(elements["iban"].substring(2), 4).join(" ");
				
				let finalRef = "";
				if (elements["version"] == 4) {
					// get rid of leading zeros
					let ref = getReferenceNumber(elements["reference"]);
					// in version 4, spaces appear every 5 characters
					finalRef = addCharacterEveryStep(ref, 5).join(" ");
				}
				else {
					// get RF code and after that get rid of leading zeros
					let ref = "RF" + elements["reference"].substring(0, 2) + getReferenceNumber(elements["reference"].substring(2));
					// in version 5, spaces appear every 4 characters
					finalRef = addCharacterEveryStep(ref, 4).join(" ");
				}
				// if there is no euroes, it should be '00'
				let euros = elements["euros"];
				if (euros == "000000")
					euros = "00";
				else euros = elements["euros"].substring(elements["euros"].lastIndexOf("0")+1);
				let amount = euros + "." + elements["cents"];

				let date = elements["date"].substring(4) + "." + elements["date"].substring(2, 4) + ".20" + elements["date"].substring(0, 2)
				
				$("#resultIban").text(finalIban);
				$("#resultReference").text(finalRef);
				$("#resultAmount").text(amount);
				$("#resultDate").text(date);

				JsBarcode("#barCodeBox", barCode, {
					format: "CODE128C"
				});
			}
		}
	});

	/* click button 'Hide' to toggle the information section */
	$("#btnHide").click(function(){
		$(".infoSection").slideToggle(500);
	});

	/* change background color of input text on entering text */
	$("#barCodeText").on("keypress", function(){
		$(this).css("background-color", "#e7e7e7")
	});

	/* change background color of input text on pasting text */
	$("#barCodeText").on("paste", function(){
		$(this).css("background-color", "#e7e7e7")
	});

	/* return background color of input to white when losing focus */
	$("#barCodeText").on("blur", function(){
		$(this).css("background-color", "white")
	});
});

function barCodeBreakDown(barCode) {
	/* break down the bar code text to retrieve the elements based on rules of Bank Bar Code */
	let elements = {}
	// Symbol version 4 is different from symbol version 5
	if (barCode[0] == "4" && barCode.length >= 54) {
		elements["version"] = "4";
		elements["iban"] = barCode.substring(1, 17);
		elements["euros"] = barCode.substring(17, 23);
		elements["cents"] = barCode.substring(23, 25);
		elements["reserve"] = barCode.substring(25, 28);
		elements["reference"] = barCode.substring(28, 48);
		elements["date"] = barCode.substring(48, 54);
	}
	else if (barCode[0] == "5" && barCode.length >= 54) {
		elements["version"] = "5";
		elements["iban"] = barCode.substring(1, 17);
		elements["euros"] = barCode.substring(17, 23);
		elements["cents"] = barCode.substring(23, 25);
		elements["reference"] = barCode.substring(25, 48);
		elements["date"] = barCode.substring(48, 54);
	}
	else return null;

	return elements;
}

function refreshFields() {
	$("#resultIban").text("");
	$("#resultReference").text("");
	$("#resultAmount").text("");
	$("#resultDate").text("");

	$('#barCodeBox').attr('src', 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==');
}

function addCharacterEveryStep(str, step) {
    let ret = [];
    let i;
    let len;

    for(i = 0, len = str.length; i < len; i += step) {
       ret.push(str.substr(i, step));
    }

    return ret;
};

function getReferenceNumber(ref) {
	for (let i = 0; i < ref.length; i++) {
		if (ref[i] !== "0")
			return ref.substring(i);
	}
}