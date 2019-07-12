---
title: Markdown Syntax
---

## Frontmatter
- Fancy word for metadata for your markdown
- Variables that can later be injected into your components
- Must be:
  - At the top of the file
  - Valid YAML
  - Between triple dashed lines
  ```
  ---
  title: My Frontmatter Title
  example_boolean: true
  ---
  ```

## Headings

```
# heading 1
## heading 2
### heading 3
#### heading 4
##### heading 5
###### heading 6
```

# heading 1

## heading 2

### heading 3

#### heading 4

##### heading 5

###### heading 6

- each heading gets converted to their HTML equivalent
  - i.e. `# heading 1` is `<h1>heading 1</h1>`
- Correct usage of each heading should follow the
  [accessibility guidelines](https://www.w3.org/WAI/tutorials/page-structure/headings/) set by the World Wide Web Consortium (W3C)

## Emphasized text

- Italic
  - one asterisk or one underscore
    - `*italic*` or `_italic_`
    - _italic!_
- Bold
  - two asterisks or two underscores
    - `**bold**` or `__bold__`
    - **bold!**
- Italic and Bold

  - three asterisks or three underscore
    - `***italic and bold***` or `___italic and bold___`
    - **_italic and bold!!_**

## Lists

- Unordered

  - can use `*, -, +`

  ```
  * Gatsby
    * docs
  - Gatsby
    - docs
  + Gatsby
    + docs
  ```

  - Gatsby
    - docs

  * Gatsby
    - docs

  - Gatsby
    - docs

- Ordered
  - use number and period
  ```
    1. One
    2. Two
    3. Three
  ```
  1. One
  2. Two
  3. Three

## Links and Images

- Link

```
[Text](url)
```

[Gatsby site](https://www.gatsbyjs.org/)

- Image with alt text

```
![alt text](path-to-image)
```

- Image without alt text

```
![](path-to-image)
```

## Blockquote

- Use `>` to declare a blockquote
- Adding multiple `>` with create nested blockquotes
- It is recommended to place `>` before each line
- You can use other markdown syntax inside blockquotes

```
> blockquote
>
> > nested blockquote
>
> > **I'm bold!**
>
> more quotes
```

> Blockquote
>
> > nested blockquote
>
> > **I'm bold!**
>
> more quotes

## Code Comments

- Inline:
  - Enclose the text in backticks \`code\`
  - Your `code` will look like this


- Code Blocks:
  - Indent a block by four spaces
  -     Your code will look like this

## Helpful Resources

- https://daringfireball.net/projects/markdown/syntax
- https://www.markdownguide.org/basic-syntax
