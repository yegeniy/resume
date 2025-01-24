SHELL := /bin/bash

all: html
	open index.html

pdf: TWINKLE = 
pdf: build
	open index.html

html: TWINKLE = -H twinkle.js
html: build

build: 
	# opting for "-T" over "--title" intentionally.
	pandoc --from gfm --to html --standalone README.md $(TWINKLE) -o index.html \
	 -T "Eugene Wolfson Résumé"\
	 -V 'header-includes=<style>body{box-sizing:border-box;width:8.5in;margin:0 auto;padding:45px}h1{text-align:center}h2{text-align:center}table,table tbody,table tr,table th,table td{background:transparent!important}table{border:none;border-collapse:collapse;width:100%;display:flex;justify-content:space-between}table thead{width:100%;border:none}table tr{display:flex;width:100%;justify-content:space-between;border:none}table th{border:none;font-weight:normal;padding:0}table th:first-child{border-right:1px solid #ddd;padding-right:1em;width:20%;min-width:20%}table th:last-child{padding-left:1em;width:80%;min-width:80%}</style><div class="markdown-body">' \
	 -c gfm.min.css \
	 -V 'include-after=</div>'

log:
	# since we're not publishing the resume history.
	git reflog --date=iso

publish: html
	# squishes all history into the initial commit.
	git reset --soft $$(git rev-list --max-parents=0 HEAD) \
	&& git commit -a --amend --no-edit \
	&& git push -f origin master
