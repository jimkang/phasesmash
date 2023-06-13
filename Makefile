include config.mk

HOMEDIR = $(shell pwd)
vite = ./node_modules/.bin/vite

deploy:
	npm version patch && make build && git commit -a -m"Build" && make pushall

pushall: sync
	git push origin main

run:
	$(vite)

build:
	npm build

sync:
	rsync -a $(HOMEDIR)/ $(USER)@$(SERVER):/$(APPDIR) \
    --exclude node_modules/

set-up-server-dir:
	ssh $(USER)@$(SERVER) "mkdir -p $(APPDIR)"
