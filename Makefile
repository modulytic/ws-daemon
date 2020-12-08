CONTAINER_NAME = ws-daemon

all: build start

build:
	docker build $(DOCKER_FLAGS) -t $(CONTAINER_NAME) $() ./

nocache:
	$(MAKE) DOCKER_FLAGS=--no-cache

start: run
prod:
	$(MAKE) run BILLING_PORT=$(PROD_BILLING_PORT)

restart:
	docker container restart $(CONTAINER_NAME)

run:
	docker run -td --name $(CONTAINER_NAME) $(CONTAINER_NAME)

rebuild: clean build
sync: rebuild start

stop:
	docker container stop $(CONTAINER_NAME)

clean: stop
	docker container rm $(CONTAINER_NAME)

logs:
	docker logs --follow $(CONTAINER_NAME)

shell: 
	docker exec -it $(CONTAINER_NAME) /bin/bash
