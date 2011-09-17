# A jstestdriver template project for running tests using jasmine/sinon

## Usage

### Clone
    $ git clone git@github.com:torgeir/jstestdriver-template.git
    $ cd jstestdriver-template
    
### Install dependencies
    $ git submodule update --init --recursive

### Install jstestdriver
    http://cjohansen.no/en/javascript/test_driven_javascript_done_right

### Build sinon
    $ cd vendor/sinon
    $ ./build
    $ cd ../..

### Remove git files
    $ rm -r .git*
    
### Rename the project to whatever suits your needs
    $ cd ..
    $ mv jstestdriver-template awesome-lib

### Running your tests
    $ cd awesome-lib
    $ jstestdriver --port 4224 &
    $ open http://localhost:4224/capture
    $ jsautotest

### Go tdd your code!