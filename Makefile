EXTNAME = "chrome-github-boxcutter"
CHROME = /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome

all: crx

zip: extension/*
	cp ./node_modules/jquery/dist/jquery.min.js ./extension
	@-rm -rf $(EXTNAME).zip $(EXTNAME) || true
	@mkdir $(EXTNAME)
	@cp extension/* $(EXTNAME)
	@mkdir dist 2> /dev/null || true
	zip -r dist/$(EXTNAME).zip $(EXTNAME)
	@-rm -rf $(EXTNAME)

crx: extension/*
	cp ./node_modules/jquery/dist/jquery.min.js ./extension
	@mkdir dist 2> /dev/null || true
	@-rm -rf dist/$(EXTNAME).crx $(EXTNAME) || true
	@mkdir $(EXTNAME)
	@cp extension/* $(EXTNAME)
ifeq ($(wildcard $(EXTNAME).pem),)
	$(CHROME) --pack-extension=$(EXTNAME)
else
	$(CHROME) --pack-extension=$(EXTNAME) --pack-extension-key=$(EXTNAME).pem
endif
	@-mv $(EXTNAME).crx dist/
	@-rm -rf $(EXTNAME)

clean:
	@-rm -rf *.zip *.crx $(EXTNAME) dist || true