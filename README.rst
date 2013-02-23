=========
Vectorite
=========

A real time IRC logger built on top of Meteor_ and Lalita_ IRC bot

Installing
==========

You need Node_ and Meteor_ for the Javascript side. For the Python side you
need Lalita_, and the async version of the MongoDB_ client for Twisted, which
you can get from https://github.com/fiorix/mongo-async-python-driver. Data
storage is achieved with MongoDB_.

Running
=======

Vectorite uses Lalita_ for pushing messages into a MongoDB_ instance. A Meteor_
application polls the database for changes. The only thing you need to do is
tell both to use the same database:

::
    
    $ MONGO_URL=mongodb://localhost:27017/meteor meteor --port 8080

That should start the Meteor app using the system MongoDB.
You will need to run the IRC bot also:

::

    $ ircbot.py vectorite.cfg -a -o debug

You can read the Lalita_ documentation for more info. A configuration file for
Lalita is included with the source and you can use it as a starting point.


.. _Node: http://www.nodejs.org
.. _Meteor: http://meteor.com/
.. _Lalita: https://pypi.python.org/pypi/lalita
.. _MongoDB: http://www.mongodb.org/
