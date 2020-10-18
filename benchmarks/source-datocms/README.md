# DatoCMS Benchmark

This benchmark requires a DatoCMS space and will source its data from there while running the benchmark.

Should/Will be generalized into e.g. a theme.

Queries the title, body and a cover image from DatoCMS. Creates pages for that and displays those three things as "Articles".
Those individual article pages and the homepage share a common "Layout" component (in src/components) that can be swapped (layout_1.js and layout_2.js) to simulate a code change in multiple pages.
