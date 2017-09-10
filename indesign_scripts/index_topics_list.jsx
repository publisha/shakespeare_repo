//DESCRIPTION: Index from word list
// Peter Kahrel -- www.kahrel.plus.com

/*
	16 Nov. 2011: fixed bug that chopped off word-final s
    sept 17 Cj stopped the closing of the docs
*/

#target indesign

// List the paragraph styles to be included, using the first three
// characters of their name (case-sensitive), and prefixed with "|".
// Use "" to ignore this and include all paragraph styles

paragraph_styles = "";
//paragraph_styles = "|def|sec";

// 'true': search documents case-sensitively,
// 'false': ignore case

case_sensitive = true;

// Replace index?

replace_index = true;


/*--------------------------------------------------------------------------

Create word-list. To create separate indexes,
prefix items with any of the symbols £ % & @.
Open all files to be concordanced, then select frame
(or insertion point) in document with concordance file.

------------------------------------------------------------------------------*/

index_from_list ();


function index_from_list ()
	{
	environment_check ();
	find_options ();	//set various options for Find
	var list = get_list (app.activeDocument);
	app.activeDocument.close (SaveOptions.yes);
	displ = init_progress ();
	index_documents (list, displ);
	}

function index_documents (word_list, displ)
	{
	for (var i = app.documents.length-1; i > -1; i--)
		{
		var doc = app.documents[i];
		displ[0].text = doc.name;
		if (replace_index == true)
			try {doc.indexes[0].topics.everyItem().remove()} catch (_){};
		if (doc.indexes.length == 0)
			doc.indexes.add ();
		for (var j = 0; j < word_list.length; j++)
			{
			displ[1].value = j;
			// split word-list entry into item to search and item to use for index
			var search_item = get_search_item (word_list[j]);
			try
				{
				var new_topic = doc.indexes[0].topics.add (word_list[j]);
				//delete prefixed symbol, if any
				app.findGrepPreferences.findWhat = search_item;
				var found = doc.findGrep();
				for (var k = found.length-1; k > -1; k--)
					{
					try
						{
						// if the found string's parent paragraph style name begins with d, q, or n
						if (style_ok (found[k]))
							new_topic.pageReferences.add (found[k], PageReferenceType.currentPage);
						} catch(_) {/* not interested in errors */}
					} // for (k
				} catch(_){}
			} // for (j
		doc.save ();
		// doc.close ();
		}
	}

// Take an item from the word list and create a search item:
// split word-list item on comma. If that fails,
// split on parenthesis. If that fails too, return the whole item.
// Wrap string in word-boundary markers and
// prefix the case-insensitive code, if necessary.

function get_search_item (s)
	{
	// delete prefixed symbol
	s = s.replace(/^[£%&@]/, "");
	// delete anything from comma or parenthesis
	s = s.replace (/\s?[,(].+$/, "");
	// add word boundaries
	s = "\\b" + s  + "\\b";
	if (case_sensitive == false)
		s = "(?i)" + s;
	return s
	}


function style_ok (w)
	{
	return ((paragraph_styles == "") ||
				(paragraph_styles.search (w.appliedParagraphStyle.name.slice (0,3)) > 0))
	}


function get_list (doc)
	{
	// Remove trailing spaces
	app.findGrepPreferences.findWhat = "\\s+$";
	app.changeGrepPreferences.changeTo = "";
	app.activeDocument.changeGrep ();
	// Remove serial spaces
	app.findGrepPreferences.findWhat = "  +";
	app.changeGrepPreferences.changeTo = " "
	app.activeDocument.changeGrep();
	return app.selection[0].parentStory.contents.split ('\r');
	}


function environment_check ()
	{
	if (parseInt (app.version) < 5)
		errorM ('The script runs only in InDesign CS3 and later versions.');
	if (app.documents == 0)
		errorM ('Open a word list and \rthe documents to be indexed.')
	if (app.documents.length == 1)
		errorM ('Open the documents to be indexed.');
	if (app.selection.length == 0)
		errorM ('Select a text frame in the word list.');
	if ('TextFrameInsertionPoint'.search (app.selection[0].constructor.name) < 0)
		errorM ('Select a text frame in the word list.');
	}

function find_options ()
	{
	app.findGrepPreferences = app.changeGrepPreferences = null;
	app.findChangeGrepOptions.includeLockedLayersForFind = false;
	app.findChangeGrepOptions.includeLockedStoriesForFind = false;
	app.findChangeGrepOptions.includeHiddenLayers = true;
	app.findChangeGrepOptions.includeMasterPages = false;
	app.findChangeGrepOptions.includeFootnotes = true;
	}


function errorM (m)
	{alert (m); exit()}


function init_progress ()
	{
	index_progress = new Window ('palette', 'Concordance' );
	index_progress.alignChildren = ['left', 'top'];
	fname = index_progress.add ('statictext', undefined, '------');
	fname.characters = 40;
	pbar = index_progress.add ('progressbar', undefined, 1, 50);
	pbar.preferredSize = [270,20];
	index_progress.show();
	return [fname,pbar];
	}
