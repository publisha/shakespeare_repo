
/*
	Convert sidenotes back to footnotes.
	The script expects the original styles names as set by the sidenotes.jsx script.
*/

#targetengine sidenotes

if (app.documents.length == 0){
	errorExit ('Please open a document.');
}

main();

function main(){
	var doc = app.documents[0];
	var sidenotes = findNotes(doc);
	var sidenotesL = sidenotes.length;
	
	if (sidenotes.length == 0) {
		errorExit ('The document contains no sidenotes.');
	}

	var w = new Window('palette {text: "Revert to footnotes"}');
		var pbar = w.add ('progressbar', undefined, 0, sidenotesL);
		pbar.preferredSize.width = 300;
	w.show();
	
	removeParagraphNumbering(doc)
	
	var fn;
	for (var i = sidenotesL-1; i >= 0; i--) {
		pbar.value = sidenotesL-i;
		fn = sidenotes[i].parent.insertionPoints[-1].footnotes.add();
		sidenotes[i].texts[0].move (LocationOptions.after, fn.insertionPoints[-1]);
		sidenotes[i].remove();
	}

	removeXRefs(doc);
	doc.objectStyles.item('sidenote').remove();
	doc.footnoteOptions.footnoteTextStyle.justification = Justification.LEFT_JUSTIFIED;
	w.close();
} // main


function removeXRefs(doc){
	var xRefs = doc.crossReferenceSources.everyItem().getElements();
	for (var i = xRefs.length-1; i >=0; i--){
		if (xRefs[i].appliedFormat.name == 'sidenote'){
			xRefs[i].sourceText.remove();
		}
	}
}


function findNotes (doc) {
	app.findObjectPreferences = null;
	app.findChangeObjectOptions.objectType = ObjectTypes.TEXT_FRAMES_TYPE;
	app.findObjectPreferences.appliedObjectStyles = doc.objectStyles.item('sidenote');
	return doc.findObject();
}


function removeParagraphNumbering (doc){
	doc.footnoteOptions.separatorText = doc.objectStyles.item('sidenote').appliedParagraphStyle.numberingExpression.replace('^#',"");
	doc.objectStyles.item('sidenote').appliedParagraphStyle.bulletsAndNumberingListType = ListType.NO_LIST;
}


function errorExit(m) {
	alert (m);
	exit();
}