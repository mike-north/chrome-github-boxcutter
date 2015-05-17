EXTNAME = "github-boxcutter"

CHROME = /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome

all: crx

zip: extension/*
	@-rm -rf github-boxcutter.zip $(EXTNAME) || true
	@mkdir $(EXTNAME)
	@cp extension/* $(EXTNAME)
	zip -r github-boxcutter.zip $(EXTNAME)

crx: extension/*
	@-rm -rf github-boxcutter.crx $(EXTNAME) || true
	@mkdir $(EXTNAME)
	@cp extension/* $(EXTNAME)
ifeq ($(wildcard github-boxcutter.pem),)
	$(CHROME) --pack-extension=$(EXTNAME)
else
	$(CHROME) --pack-extension=$(EXTNAME) --pack-extension-key=github-boxcutter.pem
endif

clean:
	@-rm *.zip || true
	@-rm *.crx || true
	@-rm -rf $(D) || true
