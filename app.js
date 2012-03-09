
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , mysql = require('mysql')
  , fs = require('fs');

var app = module.exports = express.createServer();
var client = mysql.createClient({
    user: 'root',
    password: '',
    host: 'localhost',
    database: 'node_todo',
});

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes
app.get('/', routes.index);

app.get('/write', function(req, res) {
    fs.writeFileSync('./sample.txt', '2,hoge,fugafuga,2012/03/05');
    res.redirect('/read');
});

app.post('/create', function(req, res) {
    //console.log(req.body);

    var query = client.query('insert into test (name) values (?)', [req.body.name]);
    //console.log(query);
    res.redirect('/select');
});

app.get('/update/:id', function(req, res) {
    //console.log(req.params.id);

    client.query('select * from test where id = ?', [req.params.id],
        function(err, results, fields) {
            console.log(results);
            res.render('update', {
                title: 'Update',
                data: results,
            });
        }
    );
});

app.post('/update', function(req, res) {
    //console.log(req.body);
    var query = client.query('update test set name = ? where id = ?', [req.body.name, req.body.id]);
    console.log(query);
    res.redirect('/select');
});

app.post('/delete', function(req, res) {
    console.log(req.body);
    if (! req.body.delete) {
        client.query('delete from test where id = ?', [req.body.del]);
        res.redirect('/select');
    } else {
        client.query('select * from test where id = ?', [req.body.del],
            function(err, results, fields) {
                res.render('delete', {
                    title: 'Delete',
                    data: results,
                });
            }
        );
    }
});

app.get('/select', function(req, res) {
    client.query('select * from test', function(err, results, fields) {
        if (err) {
            throw err;
        }
        
        res.render('select', {
            title: 'Select',
            results: results,
        });
    });
});

/*
app.get('/read', function(req, res) {
    //console.log(fs.readFileSync('./sample.txt'));
    res.render('read', {
        title: 'Read',
        words: fs.readFileSync('./sample.txt'),
    });
});
*/

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
