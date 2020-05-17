TWEEGO_DIR:=~/Downloads/tweego-2.1.1-macos-x64

clean:
	rm -rf build/
	mkdir build/
.PHONY: clean

format: clean
	$(TWEEGO_DIR)/tweego -o build/formatted.xml --format=jailbird ./test-twee/trivial.twee
.PHONY: format

install-format:
	rm -rf $(TWEEGO_DIR)/storyformats/jailbird
	mkdir -p $(TWEEGO_DIR)/storyformats/jailbird
	cp -r format/* $(TWEEGO_DIR)/storyformats/jailbird
.PHONY: install-format

publish:
	npm publish
.PHONY: publish