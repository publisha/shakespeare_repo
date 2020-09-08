//DESCRIPTION: Convert InDesign's footnotes to dynamic sidenotes
// Peter Kahrel - www.kahrel.plus.com

#targetengine sidenotes;

// Only CS4 and later
if (parseInt (app.version) > 5 && app.documents.length > 0) {
	try {
		foot_to_side (app.documents[0], 'sidenote');
	} catch (e) {
		alert (e.message + ' (line ' + e.line + ')');
	};
}


function foot_to_side (doc, stylename) {
	var side_frame, note_text, footn, destination, reference;
	var dimensions = sidenote_coordinates (doc);
	var styles = check_styles (doc, stylename, dimensions);
	var stories = find_stories (doc);
	var win = create_message (40, 'Sidenotes');
	win.show();
	for (var j = 0; j < stories.length; j++) {
		if (stories[j].footnotes.length === 0) continue;
		footn = stories[j].footnotes;
		for (var i = footn.length-1; i > -1; i--) {
			if (dimensions.pstyle !== 'Any' && footn[i].paragraphs[0].appliedParagraphStyle.name !== dimensions.pstyle) {
				continue;
			}
			win.message.text = 'Story ' + String (j+1) + ' -- ' + 'note ' + String (i+1);
			// Must delete the note marker here to ensure that fit() works ok
			delete_notemarkers (footn[i].texts[0].paragraphs[0]);
			// Create a frame at the footnote reference's position
			side_frame = add_frame (footn[i].storyOffset, styles.o_style, dimensions.width);
			// Move the footnote's contents to the new frame
			note_text = footn[i].texts[0].move (LocationOptions.AFTER, side_frame.insertionPoints[0]);
			if (dimensions.numbered) {
				note_text.paragraphs[0].applyParagraphStyle (styles.ps_numbered, false)
				// Create cross-reference -- three steps
				destination = doc.paragraphDestinations.add (note_text.insertionPoints[0]);
				reference = doc.crossReferenceSources.add (footn[i].storyOffset, styles.cr_format);
				doc.hyperlinks.add (reference, destination, {visible: false});
				//doc.hyperlinks.add (reference, destination, {visible: true});
			}
			if (parseInt(app.version < 8)) {
				side_frame.fit (FitOptions.FRAME_TO_CONTENT);
			}
			footn[i].remove();
		}
	}
	win.message.parent.close ();
	if (dimensions.numbered) {
		doc.crossReferenceSources.everyItem().update();
	}
	// Restore the footnote separator
	app.documents[0].footnoteOptions.separatorText = dimensions.fn_separatorText;
}



function find_stories (doc) {
	// No selection: return all stories
	if (!app.selection.length) {
		return doc.stories.everyItem().getElements();
	}
	if (app.selection[0].hasOwnProperty('parentStory')) { 
		return [app.selection[0].parentStory];
	}
	alert ('Invalid selection', 'Convert footnotes', true); 
	exit ();
}


function add_frame (ins_point, style, width) {
	var sidebar = ins_point.textFrames.add ();
	if (parseInt (app.version) < 8) { // Maybe this isn't needed in any version, but we'll leave it.
		sidebar.geometricBounds = [0, 0, '20pt', width];
	}
	sidebar.label = style.name;
	sidebar.appliedObjectStyle = style;
	return sidebar;
}


function delete_notemarkers (target) {
	app.findGrepPreferences = app.changeGrepPreferences = null;
	app.findChangeGrepOptions.includeFootnotes = true;
	//app.findGrepPreferences.findWhat = '~F'; // New bug in 2019: deletes ~F and the next character
	app.findGrepPreferences.findWhat = '^.';
	try {
		target.changeGrep();
	} catch (e) {
		alert ('Error trying to delete note markers (' + e + ')');
	}
}


function check_styles (doc, s, sidenote) {
	var styles = text_styles (doc, s, sidenote);
	footnote_options (doc);
	if (doc.objectStyles.item (s) == null) {
		with (doc.objectStyles.add ({name: s})) {
			// Store the width of the frame so we can use that later when adding notes semi-manually
			// We'll store the value in points (Don't do this any longer, frames are set to fixed width
			//label = convert_units (sidenote.width, 'pt');
			basedOn = doc.objectStyles[0];
			enableParagraphStyle = true;
			appliedParagraphStyle = styles.ps_numbered;
			enableStroke = true;
			strokeWeight = 0;
			enableAnchoredObjectOptions = true;
			with (anchoredObjectSettings) {
				spineRelative = true;
				anchoredPosition = AnchorPosition.anchored;
				anchorPoint = AnchorPoint.topRightAnchor;
				//horizontalReferencePoint = AnchoredRelativeTo.columnEdge;
				horizontalReferencePoint = AnchoredRelativeTo.pageMargins;
				anchorXoffset = sidenote.gutter;
				horizontalAlignment = HorizontalAlignment.leftAlign;
				verticalReferencePoint = VerticallyRelativeTo.capheight;
				pinPosition = true;
			}
			enableTextFrameGeneralOptions = true;
			textFramePreferences.useFixedColumnWidth = true;
			textFramePreferences.textColumnFixedWidth = sidenote.width;
			if (parseInt (app.version) >= 8) { // CS6 introduced auto height
				enableTextFrameAutoSizingOptions = true;
				textFramePreferences.autoSizingType = AutoSizingTypeEnum.HEIGHT_ONLY;
				textFramePreferences.autoSizingReferencePoint = AutoSizingReferenceEnum.TOP_CENTER_POINT;
			}
		}
	}
	styles.o_style = doc.objectStyles.item (s);
	return styles;
}


function text_styles (doc, n, sidenote) {
	if (sidenote.pstyle !== 'Any') {
		//app.documents[0].paragraphStyles.item(sidenote.pstyle).justification = Justification.TO_BINDING_SIDE;
		var ps_next = app.documents[0].paragraphStyles.item (sidenote.pstyle);
	} else {
		// unnumbered par. style for second and further paragraphs in a note
		var ps_next = doc.footnoteOptions.footnoteTextStyle;
	}
	ps_next.justification = Justification.TO_BINDING_SIDE;
	// create a new par style, based on ps_next, for the numbered (first) paragraph in each note
	var numpar = ps_next.name.replace (/[\[\]]/g, '') + '_numbered';
	try {
		var ps_num = doc.paragraphStyles.add ({
			name: numpar, 
			basedOn: ps_next,
			numberingFormat: sidenote.number_format,
			numberingStartAt: sidenote.start_number,
			numberingExpression: '^#' + doc.footnoteOptions.separatorText
		});
	} catch (_) {
		var ps_num = doc.paragraphStyles.item (numpar)
	};


	if (sidenote.numbered == true) {
		try {
			var numlist = doc.numberingLists.add ({name: n});
			numlist.continueNumbersAcrossStories = true;
			numlist.continueNumbersAcrossDocuments = true;
		} catch (_) {
			var numlist = doc.numberingLists.item (n);
		}
		
		// create char. style for references if no char style is set in the Footnote options window
		if (doc.footnoteOptions.footnoteMarkerStyle == doc.characterStyles[0]) {
			try {
				var cue_style = doc.characterStyles.add ({name: n + '_reference'});
				cue_style.position = Position.superscript;
			} catch (_) {
				var cue_style = doc.characterStyles.item (n + '_reference');
			};
		} else {
			var cue_style = doc.footnoteOptions.footnoteMarkerStyle;
		}
		
		// char style for the numbers in the notes
		try {
			var char_style = doc.characterStyles.add ({name: n + '_number'});
		} catch (_) {
		};
			
		try {
			var cr = doc.crossReferenceFormats.add ({name: n});
			cr.appliedCharacterStyle = cue_style;
			cr.buildingBlocks.add (BuildingBlockTypes.paragraphNumberBuildingBlock);
		} catch (_) {
			var cr = doc.crossReferenceFormats.item (n);
		}
			
		try {
			ps_num.appliedNumberingList = numlist;
			ps_num.bulletsAndNumberingListType = ListType.numberedList;
			ps_num.tabList = [{position: '12pt', alignment: TabStopAlignment.leftAlign}];
			ps_num.numberingCharacterStyle = char_style;
		} catch (_) {
		};
	}
	return {ps_numbered: ps_num, ps: ps_next, cr_format: cr}
}


function footnote_options (doc) {
	doc.footnoteOptions.separatorText = '';
}

// Interface =================================================================

function sidenote_coordinates (doc) {
	
	var number_styles = [
		'1, 2, 3, 4. . .',
		'01,02,03...',
		'I, II, III, IV...',
		'i, ii, iii, iv...',
		'A, B, C, D,...',
		'a, b, c, d...',
		'001,002,003...',
		'0001,0002,0003...',
	];
	
	var doc_unit = doc_units();
	
	function pstyles () {
		var list = ['Any'];
		var ps = app.documents[0].allParagraphStyles;
		for (var i = 2; i < ps.length; i++) {
			list.push (ps[i].name);
		}
		return list;
	}
		
	
	var w = new Window ('dialog', 'Sidenotes', undefined, {closeButton: false});
		w.alignChildren = 'fill';
		var main = w.add ('panel {orientation: "column", alignChildren: ["right", "top"]}');
			var g1 = main.add ('group');
				g1.add ('statictext {text: "Width of the notes: "}');
				var width = g1.add ('edittext {characters: 12, active: true}');
				width.text = convert_units ("70 pt", doc_unit);
			var g2 = main.add ('group');
				g2.add ('statictext {text: "Space between note and text: "}');
				var space = g2.add ('edittext {characters: 12}');
				space.text = convert_units ('12 pt', doc_unit);

		var numbering_group = w.add ('panel {orientation: "row"}'); //  numbering_group.orientation= "stack"
			var numbered = numbering_group.add ('checkbox {text: "Numbering", alignment: ["left", "top"]}');
			var panel = numbering_group.add ('panel {alignChildren: "right"}');
		
			var g3 = panel.add ('group');
				g3.add ('statictext', undefined, 'Style:');
				var n_styles = g3.add ('dropdownlist', undefined, number_styles);
				n_styles.preferredSize.width = 100;
				
			var g4 = panel.add ('group');
				g4.add ('statictext', undefined, 'Start at:');
				var start_value = g4.add ('edittext', undefined, '1');
				start_value.preferredSize.width = 100;
				
		var style_group = w.add ('panel {orientation: "row", alignment: "right"}');
			style_group.add ('statictext {text: "Paragraph style:"}');
			var par_styles = style_group.add ('dropdownlist', undefined, pstyles());
				par_styles.preferredSize.width = 210;

			var buttons = w.add ('group');
				buttons.orientation = 'row';
				buttons.alignChildren = ['right', 'bottom'];
				buttons.add ('button', undefined, 'OK');
				buttons.add ('button', undefined, 'Cancel');

			numbered.onClick = function () {
				panel.enabled = this.value;
			}

			start_value.onDeactivate = function () {
				if (this.text.search (/^\d+$/) < 0) {
					alert ('Enter an arabic number.');
					start_value.active = true;
				}
			}
	
		width.onChange = function () {
			width.text = convert_units (width.text, doc_unit);
		}
	
		space.onChange = function () {
			space.text = convert_units (space.text, doc_unit);
		}
		
		w.onShow = function () {
			numbered.value = true;
			n_styles.selection = 0;
			par_styles.selection = 0;
		}
		
	if (w.show () == 2) exit ();
	
	return {
		width: width.text, 
		gutter: space.text, 
		numbered: numbered.value,
		number_format: get_format (n_styles.selection.index),
		start_number: Number (start_value.text),
		pstyle: par_styles.selection.text,
		fn_separatorText: app.documents[0].footnoteOptions.separatorText
	}
} // sidenote_coordinates


function get_format (index) {
	return [
		NumberingStyle.ARABIC,
		NumberingStyle.SINGLE_LEADING_ZEROS,
		NumberingStyle.UPPER_ROMAN,
		NumberingStyle.LOWER_ROMAN,
		NumberingStyle.UPPER_LETTERS,
		NumberingStyle.LOWER_LETTERS,
		NumberingStyle.DOUBLE_LEADING_ZEROS,
		NumberingStyle.TRIPLE_LEADING_ZEROS][index];
}

function convert_units (n, to) {
	var unitConversions = {
		'pt': 1.0000000000,
		'p': 12.0000000000,
		'mm': 2.8346456692,
		'in': 72.00000000,
		'ag': 5.1428571428,
		'cm': 28.3464566929,
		'c': 12.7878751998,
		'tr': 3.0112500000 // traditional point -- but we don't do anything with it yet
	}
	var obj = fix_measurement (n);
	var temp = (obj.amount * unitConversions[obj.unit]) / unitConversions[to];
	return output_format (temp, to)
}

// Add the target unit to the amount, either suffixed pt, ag, mm, cm, in, or infixed p or c

function output_format (amount, target) {
	amount = amount.toFixed(3).replace(/\.?0+$/, '');
	if (target.length == 2) { // two-character unit: pt, mm, etc.
		return String (amount) + ' ' + target;
	} else {// 'p' or 'c'
		// calculate the decimal
		var decimal = (Number (amount) - parseInt (amount)) * 12;
		// return the integer part of the result + infix + formatted decimal
		return parseInt (amount) + target + decimal;
		}
}


function fix_measurement (n) {
	n = n.replace(/ /g,'');
	// infixed 'p' and 'c' to decimal suffixes: 3p6 > 3.5 p
	n = n.replace (/(\d+)([pc])([.\d]+)$/, function () {return Number (arguments[1]) + Number (arguments[3]/12) + arguments[2]});
	// split on unit
	var temp = n.split (/(ag|cm|mm|c|pt|p|in)$/);
	return {amount: Number (temp[0]), unit: temp.length === 1 ? doc_units() : temp[1]};
}


function doc_units () {
	switch (app.documents[0].viewPreferences.horizontalMeasurementUnits){
		case 2051106676: return 'ag';
		case 2053336435: return 'cm';
		case 2053335395: return 'c';
		case 2053729891: return 'in';
		case 2053729892: return 'in';
		case 2053991795: return 'mm';
		case 2054187363: return 'p';
		case 2054188905: return 'pt';
		}
}


function errorM (m) {
	alert (m, 'Error', true);
	exit ();
}


function progress_bar (stop, title) {
	var w = new Window ('palette', title);
	w.pbar = w.add ('progressbar', undefined, 0, stop);
	w.pbar.preferredSize.width = 300;
	return w;
}


function create_message (le, title) {
	var w = new Window ('palette', title);
	w.alignChildren = ['left', 'top'];
	w.message = w.add ('statictext', undefined, '');
	w.message.characters = le;
	return w;
}

