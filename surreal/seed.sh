#!/bin/bash

CONTENT_TYPE="Content-Type: application/json"
DATABASE="DB: test"
NAMESPACE="NS: test"


function request {
    RES=`curl --request POST --compressed \
        --header "Content-Type: application/json" \
        --header "DB: test" \
        --header "NS: test" \
        --user "root:root" \
        --data "$1" \
        http://localhost:8000/sql`

    echo $RES | jq
}

request "INFO FOR DB;"
