EXTNAME = "github-boxcutter"

CHROME = /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome

all: crx

zip: extension/*
	@-rm -rf github-boxcutter.zip $(EXTNAME) || true
	@mkdir $(EXTNAME)
	@cp extension/* $(EXTNAME)
	@mkdir dist 2> /dev/null || true
	zip -r dist/github-boxcutter.zip $(EXTNAME)
	@-rm -rf $(EXTNAME)

crx: extension/*
	@mkdir dist 2> /dev/null || true
	@-rm -rf dist/github-boxcutter.crx $(EXTNAME) || true
	@mkdir $(EXTNAME)
	@cp extension/* $(EXTNAME)
ifeq ($(wildcard github-boxcutter.pem),)
	$(CHROME) --pack-extension=$(EXTNAME)
else
	$(CHROME) --pack-extension=$(EXTNAME) --pack-extension-key=github-boxcutter.pem
endif
	@-mv $(EXTNAME).crx dist/
	@-rm -rf $(EXTNAME)

clean:
	@-rm -rf *.zip *.crx $(EXTNAME) dist || true