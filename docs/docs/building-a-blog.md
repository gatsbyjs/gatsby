---
title: Building a Blog Site With Gaysby
---

Now create the Gatsby App first
```
$ gatsby new my-blog-site
```
Now Enter in directory
```
$ cd new-blog-site
```

Now start the app in browser
```
$ gatsby develop
```
It will start local server at
```
http://localhost:8000/
```
Now go to src folder and create a folder in it name it components and make a js file named blog.js
and in blog.js
```
import React from "react";
import "./Blog.css";

const Blog = () => {
    return (
<div>
<header>
	<h1>Simple <span>HTML5</span> blog</h1>
</header>
<nav>
  <header>
    Navigation menu
  </header>
	<ul>
		<li><span>Blog</span></li>
		<li><a href="">About</a></li>
		<li><a href="">Contact</a></li>
	</ul>
</nav>
<section>
  <header>    
    <h1>Blog posts for April 2016</h1>    
  </header>
  <article>
    <header>
      <h1><a href="">Information about this example</a></h1>
      This example is a modified version of <a href="http://netstream.ru/htmlsamples/html5-blog/index.html">http://netstream.ru/htmlsamples/html5-blog/index.html</a>
    </header>
    <p>Try to move the mouse on different elements. The structure will be highlighted and you will be able to see the different inclusions of elements one in each other. If you move the cursor to this sentence, it will be highlighted in dark grey, showing the presence of an &lt;article&gt; element, surrounded by a &lt;section&gt; element (light grey), etc. So we have some articles in a single section element. The page title at the top is a &lt;header&gt; element, while  the tag cloud on the right is a &lt;aside&gt; element. The main menu on top (with Blog, About, Contact) is a &lt;nav&gt; element.</p>
     <figure>
  <img src="http://www.fredcavazza.net/files/2009/09/html5_structure.png" alt="Example of HTML5 structuring tags" />
  <figcaption>
    Fig. 1 : an example of how new structuring elements could be used. This page put a &lt;nav&gt; on top, and does not have headers and footer for each article, like in this figure, but it could... By the way, this is a &lt;figcaption&gt; inside a &lt;figure&gt; element...
  </figcaption>
</figure>
  </article>
	<article>
		<header>
			<h1><a href="">History</a></h1>
		</header>
		<p>Work on HTML 5 originally started in late 2003, as a proof of concept to show that it was possible to extend HTML 4's forms to provide many of the features that XForms 1.0 introduced, without requiring browsers to implement rendering engines that were incompatible with existing HTML Web pages. At this early stage, while the draft was already publicly available, and input was already being solicited from all sources, the specification was only under Opera Software's copyright.</p>
		<p>In early 2004, some of the principles that underlie this effort, as well as an early draft proposal covering just forms-related features, were presented to the W3C jointly by Mozilla and Opera at a workshop discussing the future of Web Applications on the Web. The proposal was rejected on the grounds that the proposal conflicted with the previously chosen direction for the Web's evolution.</p>
		<p>Shortly thereafter, Apple, Mozilla, and Opera jointly announced their intent to continue working on the effort. A public mailing list was created, and the drafts were moved to the WHATWG site. The copyright was subsequently amended to be jointly owned by all three vendors, and to allow reuse of the specifications.</p>
		<p>In 2006, the W3C expressed interest in the specification, and created a working group chartered to work with the WHATWG on the development of the HTML 5 specifications. The working group opened in 2007. Apple, Mozilla, and Opera allowed the W3C to publish the specifications under the W3C copyright, while keeping versions with the less restrictive license on the WHATWG site.</p>
		<p>Since then, both groups have been working together.</p>
	</article>
	<article>
		<header>
			<h1><a href="">HTML vs XHTML</a></h1>
		</header>
		<p>This specification defines an abstract language for describing documents and applications, and some APIs for interacting with in-memory representations of resources that use this language.</p>
		<p>The in-memory representation is known as  DOM5 HTML , or  the DOM  for short.</p>
		<p>There are various concrete syntaxes that can be used to transmit resources that use this abstract language, two of which are defined in this specification.</p>
		<p>The first such concrete syntax is  HTML5 . This is the format recommended for most authors. It is compatible with most legacy Web browsers. If a document is transmitted with the MIME type text/html, then it will be processed as an  HTML5  document by Web browsers.</p>
		<p>The second concrete syntax uses XML, and is known as  XHTML5 . When a document is transmitted with an XML MIME type, such as application/xhtml+xml, then it is processed by an XML processor by Web browsers, and treated as an  XHTML5  document. Authors are reminded that the processing for XML and HTML differs; in particular, even minor syntax errors will prevent an XML document from being rendered fully, whereas they would be ignored in the  HTML5  syntax.</p>
		<p>The  DOM5 HTML ,  HTML5 , and  XHTML5  representations cannot all represent the same content. For example, namespaces cannot be represented using  HTML5 , but they are supported in  DOM5 HTML  and  XHTML5 . Similarly, documents that use the noscript feature can be represented using  HTML5 , but cannot be represented with  XHTML5  and  DOM5 HTML . Comments that contain the string  ->  can be represented in  DOM5 HTML  but not in  HTML5  and  XHTML5 . And so forth.</p>
	</article>
</section>
<aside>
	<h1>Tag cloud</h1>
	<ul class="tag-cloud">
		<li><a href="" rel="tag" class="w2">ajax</a></li>
		<li><a href="" rel="tag" class="w8">apple</a></li>
		<li><a href="" rel="tag" class="w3">css</a></li>
		<li><a href="" rel="tag" class="w6">firefox</a></li>
		<li><a href="" rel="tag" class="w8">google</a></li>
		<li><a href="" rel="tag" class="w2">html</a></li>
		<li><a href="" rel="tag" class="w2">internet explorer</a></li>
		<li><a href="" rel="tag" class="w6">iphone</a></li>
		<li><a href="" rel="tag" class="w9">css3</a></li>
		<li><a href="" rel="tag" class="w2">ipod</a></li>
		<li><a href="" rel="tag" class="w5">javascript</a></li>
		<li><a href="" rel="tag" class="w1">jquery</a></li>
		<li><a href="" rel="tag" class="w2">mac</a></li>
		<li><a href="" rel="tag" class="w4">opera</a></li>
		<li><a href="" rel="tag" class="w2">rss</a></li>
		<li><a href="" rel="tag" class="w10">html5</a></li>
		<li><a href="" rel="tag" class="w2">web</a></li>
		<li><a href="" rel="tag" class="w8">web 2.0</a></li>
		<li><a href="" rel="tag" class="w1">web-??????????</a></li>
		<li><a href="" rel="tag" class="w3">windows</a></li>
		<li><a href="" rel="tag" class="w2">yahoo</a></li>
		<li><a href="" rel="tag" class="w7">youtube</a></li>
	</ul>
</aside>
<footer>
	<p>&copy; 2009 Some blog</p>
</footer>
</div>
   );
}
export default Blog
```
and Now Our jsx is ready 

now make css file in components folder named Blog.css

and in Blog.css
```

html {
    font-size: 100.01%;
}

/* reset */

html, body, div, span, applet, object, iframe, h1, h2, h3, h4, h5, h6, p, blockquote, pre, a, abbr, acronym, address, big, cite, code, del, dfn, em, font, img, ins, kbd, q, s, samp, small, strike, strong, sub, sup, tt, var, hr, b, u, i, center, dl, dt, dd, ol, ul, li, fieldset, form, label, legend, table, caption, tbody, tfont, thead, tr, th, td {
    padding: 0;
    margin: 0;
    border: none;
    outline: none;
    vertical-align: baseline;
    font-family: inherit;
    font-size: 100%;
}

dfn, i, cite, var, address, em {
    font-style: normal;
}

th, b, strong, h1, h2, h3, h4, h5, h6 {
    font-weight: normal;
}

textarea, input, select {
    font-family: inherit;
    font-size: 1em;
}

blockquote, q {
    quotes: none;
}

q:before, q:after, blockquote:before, blockquote:after {
    content: '';
    content: none;
}

ol, ul {
    list-style: none;
}

ins {
    text-decoration: none;
}

del {
    text-decoration: line-through;
}

table {
    border-collapse: collapse;
    border-spacing: 0;
}

caption, th, td {
    text-align: left;
}

:focus {
    outline: none;
}

html, body {
    height: 100%;
}

body {
    font: .8125em/1.5 Tahoma, Verdana, Geneva, Arial, Helvetica, sans-serif;
    background: #fff;
    color: #333;
}

header, nav, section, article, aside, footer {
    display: block
}

a {
    color: #267;
    text-decoration: underline
}

a:hover {
    color: #722
}

p {
    margin: 0 0 1em
}

header {
    color: #007e99;
    font-size: 2.5em;
    padding: 20px 50px
}

header span {
    color: #722
}

nav {
    font-size: 1.5em;
    margin: 5px 0;
    padding: 20px 50px
}

nav li {
    display: inline;
    margin: 0 15px
}

nav li:first-child {
    margin-left: 0
}

nav span, nav a {
    padding: 3px 15px 4px
}

nav span {
    background: #722;
    color: #fff
}

nav header {
    margin-left: 0;
    font-size: 12px;
    padding: 0
}

section {
    float: left;
    padding: 35px 0;
    position: relative;
    width: 70%
}

section article {
    margin: 0 50px 40px;
    padding: 25px 0 0;
    position: relative
}

section header {
    font-size: 1em;
    padding: 0;
}

section h1 {
    font-size: 2.3em;
}

aside {
    float: right;
    padding: 70px 0 30px;
    position: relative;
    width: 25%
}

aside h1 {
    color: #888;
    font-size: 1.8em
}

aside .tag-cloud {
    padding: 15px 35px 10px 0;
    text-align: center
}

aside .tag-cloud li {
    display: inline
}

aside .tag-cloud a {
    color: #69a
}

aside .tag-cloud a:hover {
    color: #a67
}

aside .tag-cloud .w1 {
    font-size: .8em
}

aside .tag-cloud .w2 {
    font-size: 1em
}

aside .tag-cloud .w3 {
    font-size: 1.1em
}

aside .tag-cloud .w4 {
    font-size: 1.2em
}

aside .tag-cloud .w5 {
    font-size: 1.3em
}

aside .tag-cloud .w6 {
    font-size: 1.4em
}

aside .tag-cloud .w7 {
    font-size: 1.5em
}

aside .tag-cloud .w8 {
    font-size: 1.6em
}

aside .tag-cloud .w9 {
    font-size: 1.8em
}

aside .tag-cloud .w10 {
    font-size: 2em
}

figcaption {
    font-style: italic;
    font-size: 0.8em;
    width: 100%
}

footer {
    clear: both;
    color: #777;
    padding: 10px 50px
}

header:hover, nav:hover, section:hover, aside:hover, footer:hover {
    background: #eee
}

article:hover {
    background: #ccc
}

article header:hover {
    background: #ccc
}
```
And it is almost ready but you cannot view it because in src folder App.js
```
import React from 'react';
import Blog from './components/Blog';


function App() {
  return (
    <div className="App">
     <Blog />
    </div>
  );
}

export default App;
```
Boom !!!
Now Your Blog site is ready
and you can now view it in your browser

And Dont Forget To Give This Repo A Start It Will Means Alot
