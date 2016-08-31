# Markdown
## Introduction
Before we begin, I should explain that I am editing this text as markdown.

*Markdown* is a simple markup language that allows for structured text to be edited simply without the bloat of word processors like Microsoft Word.

I am entering the markdown tags by using special character, but if you view this in the editor, you will notice 2 things:

- You can use the editor toolbar at the top, to create the structure (H1,H2,H3 etc)
- I have used the code block (starting and finishing with 3 backticks \`\`\`) to display what the markdown syntax looks like)

```
I entered the text above thus:
# Markdown
##Introduction
Before we begin, I should explain that I am editing this text in markdown. I am entering the markdown tags by using special character, but if you view this in the editor, you will notice 2 things:

- You can use the editor toolbar at the top, to create the structure (H1,H2,H3 etc)
- I have used the code block (starting and finishing with 3 backticks \`\`\`) to display what the markdown syntax looks like)
```
There are some differences between the way markdown is implented in various software and online tools.
##Here is some 'markdown' (this is a second level heading)
You will notice that I didn't press the return key twice because I am entering text after a heading. You *can* enter the return twice and it will still display as a new line with a break.
###This is a third level heading and I also do not need to enter twice
This is a paragraph but if I know need a second paragraph I will need to hit the return twice.

Here is the second paragraph and I am also adding some *italics* text and a little bit of **bold**. To get this second paragraph I entered the return key twice.

```
I entered this thus:
##Here is some 'markdown' (this is a second level heading)
You will notice that I didn't press the return key twice because I am entering text after a heading. You *can* enter the return twice and it will still display as a new line with a break.
###This is a third level heading and I also do not need to enter twice
This is a paragraph but if I know need a second paragraph I will need to hit the return twice.

Here is the second paragraph and I am also adding some *italics* text and a little bit of **bold**. To get this second paragraph I entered the return key twice.
```
##Lists

If we want a list with bullet points then we do this:

```
+ Chicken
+ Lemon
+ Mustard
+ White wine
- Tarragon
* Garlic
```

+ Chicken
+ Lemon
+ Mustard
+ White wine
- Tarragon
* Garlic

You will see that we can use a + or - sign. Or even an asterix.

To move on from the list hit return twice
A numbered list works like this:

```
1. Assign
2. Consider
3. Discuss
4. Deliver

```

1. Assign
2. Consider
3. Discuss
4. Deliver

##Blockquotes

If you want to indent some text as in a quotation then you use this > in front

```
> Now is the winter of our discontent
> Made glorious summer by this sun of York;
> And all the clouds that lour'd upon our house
> In the deep bosom of the ocean buried.
> Now are our brows bound with victorious wreaths;
> Our bruised arms hung up for monuments;
Our stern alarums changed to merry meetings,
Our dreadful marches to delightful measures.
```

> Now is the winter of our discontent
> Made glorious summer by this sun of York;
> And all the clouds that lour'd upon our house
> In the deep bosom of the ocean buried.
> Now are our brows bound with victorious wreaths;
> Our bruised arms hung up for monuments;
Our stern alarums changed to merry meetings,
Our dreadful marches to delightful measures.

If you want multiple lines like this in one blockqute then you need a **soft-break** at the end of each line. A soft-break in this editor is achieved by using shift-break. You will notice though that you do not need the > at the front of each line. It is optional.

###More Markdown
There are **lots** of other things that you can do with Markdown, such as links, images and code, but for our purposes we are going to leave more sophisticated formatting until we get our text into _InDesign_.

##Markdown to InDesign
Although there is a script that will help us get our text into InDesign, there is one element that we cannot resolve with a script; footnotes are a little more complex. So, we need to convert our markdown copy to another text format that InDesign can use. It turns out that we can convert to _ICML_. This is a format that the InDesign suster program uses called InCopy.

###Pandoc to the rescue
Fortunately the clever http://johnmacfarlane.net/ has created this software to convert anything to anything else. We have already converted the _Life of Shakespeare_ to an ICML file but if you want to edit 'Life of Shakespeare' text and convert it yourself it is as as simple as going to the Terminal application on the Mac and typing:

`pandoc -s -o shakespeare.icml Downloads/Outline-of-his-life.md`

##From ICML to InDesign
Once you have your inDesign document started then use File>Place> choose the ICML file and the text will flow.
