#! /bin/sh

chmod +x ./setup.sh
./setup.sh

# Make sure all scripts are executable
for file in ./scripts/*; do
    chmod +x $file
done

npm start
