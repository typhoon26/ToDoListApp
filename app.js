//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _=require('lodash')
const app = express();


app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect('mongodb+srv://ashwin0200:%40shw1nR%23m@cluster0.grcvo.mongodb.net/todolistdb', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const itemschema = new mongoose.Schema({
  name: String
});
const Item = mongoose.model("Item", itemschema);
const cook = new Item({
  name: "Cooking"
})
const clean = new Item({
  name: "Clean"
})
const cycle = new Item({
  name: "Cycle"
})
defaultItems = [cook, clean, cycle];

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemschema]
});
const List = mongoose.model("List", listSchema);

// Item.insertMany(defaultItems,function(err){
//   if(err){
//     console.log('error');
//   }
//   else{
//     console.log('Saved Default items');
//   }
// });

app.get('/favicon.ico', (req, res) => res.status(204));
app.get("/", function(req, res) {

  Item.find({}, function(err, itemsoflist) {
    if (err) {
      console.log(err);
    } else {
      console.log(itemsoflist);
      if (itemsoflist.length === 0) {
        Item.insertMany(defaultItems, function(err) {
          if (err) {
            console.log(err);
          } else {
            console.log('Saved Default items');
          }
        });
        res.redirect("/")
      } else {
        res.render("list", {
          listTitle: "Today",
          newListItems: itemsoflist
        }); //removed day to reduce complexity
      }
    };
  });




});

app.post("/", function(req, res) {

  const item = req.body.newItem;
  const listn = req.body.list;
  const addeditem = new Item({
    name: item
  });
  console.log(listn);
  if (listn === "Today") {
    addeditem.save();
    res.redirect("/");
  } else {
    List.findOne({
      name: listn
    }, function(err, retlist) {
      if (retlist) {
        // console.log("this is it:" + retlist);
        // console.log(typeof retlist);
        // console.log(retlist);
        // console.log(retlist.name);
        retlist.items.push(addeditem);
        // console.log(retlist);
        retlist.save();
      }

      res.redirect("/" + listn);
    });
  }
});

app.post("/delete", function(req, res) {
  const item_id = req.body.checkbox;
  const listName = req.body.listName;
  if (listName === "Today") {
    Item.findByIdAndRemove(item_id, function(err, delitem) {
      if (err) {
        console.log(err);
      } else {
        console.log("successfuly deleted " + delitem);
        res.redirect("/");
      }
    });
  } else {
    // List.find({
    //   name: listName
    // }, function(err, ret) {
    //   if(!err){console.log(listName+"bla"+ret);}
    // });
    List.findOneAndUpdate({
      name: listName
    }, {
      $pull: {
        items: {
          _id: item_id
        }
      }
    }, function(err, foundlist) {
      if (!err) {
        console.log("Here" + foundlist);
        res.redirect("/" + listName);
      } else {
        console.log(err);
      }
    });
  }
});

app.get("/:listcategory", function(req, res) {
  const listname = _.capitalize(req.params.listcategory);
  console.log(listname);
  List.findOne({
    name: listname
  }, function(err, retlist) {
    if (!err) {
      if (!retlist) {
        console.log("Does not Exist");
        const list = new List({
          name: listname,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + listname);
      } else {
        // console.log("Exists");
        // console.log(typeof retlist);
        // console.log(retlist.name);
        // console.log(retlist.items);
        res.render("list", {
          listTitle: listname,
          newListItems: retlist.items
        });
      }
    }
  });
});

app.get("/about", function(req, res) {
  res.render("about");
});
let port= process.env.PORT;
if(port==null || port==""){
  port=3000;
}
app.listen(port, function() {
  console.log("Server started");
});
