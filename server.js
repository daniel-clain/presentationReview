var express = require('express');
var app = express();
var path = require('path');
var Busboy = require('busboy');
var cors = require('cors');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');

var whitelist = ['http://localhost:4200', 'http://localhost:4000'];
var corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1 || origin === undefined) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.static('dist'));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

http.listen(4000, function(){
  console.log('Server: listening on *:4000');
});

app.post('/upload', function(req, res){

  var busboy = new Busboy({ headers: req.headers });
  busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
    var saveTo = path.join('./profilePics/', filename);
    console.log('Uploading: ' + saveTo);
    file.pipe(fs.createWriteStream(saveTo));
  });
  busboy.on('finish', function() {
    console.log('Upload complete');
    res.writeHead(200, { 'Connection': 'close' });
    res.end("That's all folks!");
  });
  return req.pipe(busboy);

});

io.on('connection', function(socket){
  console.log('a user connected');

  socket.on('sentFromApp', function(sendObj){
    if(sendObj['event'] === 'getPresentations'){
      sendPresentationsList(sendObj, socket)
    }
    if(sendObj['event'] === 'getReviewItems'){
      sendReviewItemsList(sendObj, socket)
    }
    if(sendObj['event'] === 'addPresentation'){
      addPresentation(sendObj, socket)
    }
    if(sendObj['event'] === 'addSpeakerToPresentation'){
      addSpeakerToPresentation(sendObj, socket)
    }
    if(sendObj['event'] === 'updateSpeaker'){
      updateSpeaker(sendObj, socket)
    }
    if(sendObj['event'] === 'updateAllPresentations') {
      updateAllPresentations(sendObj, socket)
    }


  });

  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
});

addPresentation = function(sendObj, socket){
  getPresentationReviewJson().then(
    function(presentationReviewData) {
      presentationReviewData.unshift(sendObj.data);
      savePresentationReviewJson(presentationReviewData).then(
        function () {
          console.log('Presentation List Saved');
          broadcastUpdate(socket, presentationReviewData)
        }
      );
    }
  )
};

addSpeakerToPresentation = function(sendObj, socket){
  getPresentationReviewJson().then(
    function(presentationReviewData) {
      var speakersPresentation;
      presentationReviewData.forEach(function(presentation){
        if (presentation.id === sendObj.data.presentationId) {
          speakersPresentation = presentation;
        }
      });
      if (speakersPresentation) {
        speakersPresentation.speakers.unshift(sendObj.data.speaker);
        savePresentationReviewJson(presentationReviewData).then(
          function () {
            console.log('New Speaker Saved');
            broadcastUpdate(socket, presentationReviewData)
          }
        );
      } else {
        console.log('Speaker\'s Presentation not found')
      }
    }
  );
};


updateSpeaker = function(sendObj, socket){
  getPresentationReviewJson().then(
    function(presentationReviewData) {
      var speakersPresentation;
      presentationReviewData.forEach(function(presentation){
        if (presentation.id === sendObj.data.presentationId) {
          speakersPresentation = presentation;
        }
      });
      if (speakersPresentation) {
        var speakers = speakersPresentation.speakers;
        for (var i = 0; i < speakers.length; i++){
          if (speakers[i].id === sendObj.data.speaker.id){
            speakersPresentation.speakers[i] = sendObj.data.speaker;
          }
        };
        savePresentationReviewJson(presentationReviewData).then(
          function () {
            console.log('Speaker updated');
            broadcastUpdate(socket, presentationReviewData)
          }
        );
      } else {
        console.log('Speaker\'s Presentation not found')
      }
    }
  );
};

updateAllPresentations = function(sendObj, socket){
  savePresentationReviewJson(sendObj.data.entirePresentationsList).then(function(){
      console.log('All presentations updated');
      broadcastUpdate(socket, sendObj.data.entirePresentationsList)
    }
  );
};
sendReviewItemsList = function(sendObj, socket){
  getReviewItemsJson().then(
    function(data){
      socket.emit('sentFromServer', {event: 'serverSendReviewItems', data: data});
      console.log('serverSendReviewItems');
    },
    function(error){
      console.log(error)
    }
  );
};

sendPresentationsList = function(sendObj, socket){
  getPresentationReviewJson().then(
    function(data){
      socket.emit('sentFromServer', {event: 'serverSendPresentationsData', data: data});
      console.log('sendPresentationsList');
    },
    function(error){
      console.log(error)
    }
  );
};

broadcastUpdate = function(socket, presentationReviewData){
  socket.emit('sentFromServer', {
    event: 'serverSaveSuccessful',
    data: presentationReviewData
  });

  socket.broadcast.emit('sentFromServer', {
    event: 'serverDataUpdateBroadcast',
    data: presentationReviewData
  });
};

getReviewItemsJson = function(){
  return new Promise(function(resolve) {
    fs.readFile('./data/reviewItems.json', 'utf8', function readFileCallback(err, data){
      if (err){
        //console.log(err);
        console.log('reviewItems.json not found in data folder, creating empty reviewItem object');
        resolve(demoReviewItems);
      } else {
          console.log('reviewItems.json found');
        var obj = JSON.parse(data);
        resolve(obj);
      }});
  });
};


getPresentationReviewJson = function(){
  return new Promise(function(resolve) {
    fs.readFile('./data/presentationReviewData.json', 'utf8', function readFileCallback(err, data){
      if (err){
        // console.log(err);
        console.log('presentationReviewData.json not found in data folder, creating empty reviewItem object');
        resolve(demoData);
      } else {
          console.log('presentationReviewData.json found')
        var obj = JSON.parse(data);
        resolve(obj);
      }});
  });
};

savePresentationReviewJson = function(presentationReviewData){
  return new Promise(function(resolve, reject) {
    var string = JSON.stringify(presentationReviewData,null,'\t');
    fs.writeFile('./data/presentationReviewData.json',string,function(err) {
      if(err) {
        reject('Server could not save to presentationReviewData.json\n Error: '+err);
        return console.error(err);
      }
      resolve()
    })
  });
};

demoData = [
  {
    "name": "CMS Team Sprint Review",
    "id": 1506531595844,
    "speakers": [
      {
        "name": "Monika",
        "id": 1506540461938,
        "submittedReviews": [
          {
            "reviewItems": [
              {
                "reviewItemId": 111,
                "rating": 1
              },
              {
                "reviewItemId": 222,
                "rating": 3
              },
              {
                "reviewItemId": 333,
                "rating": 3
              },
              {
                "reviewItemId": 444,
                "rating": 3
              },
              {
                "reviewItemId": 555,
                "rating": 3
              },
              {
                "reviewItemId": 666,
                "rating": 3
              },
              {
                "reviewItemId": 777,
                "rating": 3
              },
              {
                "reviewItemId": 888,
                "rating": 3
              },
              {
                "reviewItemId": 999,
                "rating": 3
              }
            ],
            "reviewerId": "1506533598492"
          }
        ],
        "claimedUserEmails": []
      },
      {
        "name": "Aydin",
        "id": 1506537461975,
        "submittedReviews": []
      },
      {
        "name": "Daniel",
        "id": 1506531610996,
        "submittedReviews": [
          {
            "reviewItems": [
              {
                "name": "Quality of Information",
                "info": "Did this presentation have quality information on what was being presented?",
                "rating": 1
              },
              {
                "name": "Easy to follow",
                "info": "Did you follow what the speaker was talking about throughout the presentation?",
                "rating": 1
              },
              {
                "name": "Speaker explained things well",
                "info": "Did the speaker explain the main ideas in a clear and understandable way?",
                "rating": 1
              },
              {
                "name": "Visuals were useful",
                "info": "xxxxxbenefit",
                "rating": 1
              },
              {
                "name": "Good examples & demonstration",
                "info": "xxxxxbenefit",
                "rating": 1
              },
              {
                "name": "Value of the presentation is clear",
                "info": "xxxxxbenefit",
                "rating": 1
              },
              {
                "name": "Speaker engaged the audience",
                "info": "xxxxxbenefit",
                "rating": 1
              },
              {
                "name": "Clear on how to take action",
                "info": "xxxxxbenefit",
                "rating": 1
              },
              {
                "name": "Presentation was well prepared",
                "info": "xxxxxbenefit",
                "rating": 1
              }
            ],
            "reviewerId": "1506532871575",
            "reviewerEmail": "fred.flinstone@gmail.com"
          },
          {
            "reviewItems": [
              {
                "name": "Quality of Information",
                "info": "Did this presentation have quality information on what was being presented?",
                "rating": 2
              },
              {
                "name": "Easy to follow",
                "info": "Did you follow what the speaker was talking about throughout the presentation?",
                "rating": 3
              },
              {
                "name": "Speaker explained things well",
                "info": "Did the speaker explain the main ideas in a clear and understandable way?",
                "rating": 1
              },
              {
                "name": "Visuals were useful",
                "info": "xxxxxbenefit",
                "rating": 4
              },
              {
                "name": "Good examples & demonstration",
                "info": "xxxxxbenefit",
                "rating": 5
              },
              {
                "name": "Value of the presentation is clear",
                "info": "xxxxxbenefit",
                "rating": 4
              },
              {
                "name": "Speaker engaged the audience",
                "info": "xxxxxbenefit",
                "rating": 5
              },
              {
                "name": "Clear on how to take action",
                "info": "xxxxxbenefit",
                "rating": 1
              },
              {
                "name": "Presentation was well prepared",
                "info": "xxxxxbenefit",
                "rating": 1
              }
            ],
            "reviewerId": "1506524455321"
          }
        ],
        "averageReviewReport": [
          {
            "name": "Quality of Information",
            "info": "Did this presentation have quality information on what was being presented?",
            "rating": 2
          },
          {
            "name": "Easy to follow",
            "info": "Did you follow what the speaker was talking about throughout the presentation?",
            "rating": 2
          },
          {
            "name": "Speaker explained things well",
            "info": "Did the speaker explain the main ideas in a clear and understandable way?",
            "rating": 1
          },
          {
            "name": "Visuals were useful",
            "info": "xxxxxbenefit",
            "rating": 3
          },
          {
            "name": "Good examples & demonstration",
            "info": "xxxxxbenefit",
            "rating": 3
          },
          {
            "name": "Value of the presentation is clear",
            "info": "xxxxxbenefit",
            "rating": 3
          },
          {
            "name": "Speaker engaged the audience",
            "info": "xxxxxbenefit",
            "rating": 3
          },
          {
            "name": "Clear on how to take action",
            "info": "xxxxxbenefit",
            "rating": 1
          },
          {
            "name": "Presentation was well prepared",
            "info": "xxxxxbenefit",
            "rating": 1
          }
        ],
        "claimedUserEmails": [
          "daniel.clain@talktalkplc.com"
        ]
      },
      {
        "name": "Scott",
        "id": 1506531609348,
        "submittedReviews": [
          {
            "reviewItems": [
              {
                "name": "Quality of Information",
                "info": "Did this presentation have quality information on what was being presented?",
                "rating": 1
              },
              {
                "name": "Easy to follow",
                "info": "Did you follow what the speaker was talking about throughout the presentation?",
                "rating": 1
              },
              {
                "name": "Speaker explained things well",
                "info": "Did the speaker explain the main ideas in a clear and understandable way?",
                "rating": 1
              },
              {
                "name": "Visuals were useful",
                "info": "xxxxxbenefit",
                "rating": 1
              },
              {
                "name": "Good examples & demonstration",
                "info": "xxxxxbenefit",
                "rating": 1
              },
              {
                "name": "Value of the presentation is clear",
                "info": "xxxxxbenefit",
                "rating": 1
              },
              {
                "name": "Speaker engaged the audience",
                "info": "xxxxxbenefit",
                "rating": 1
              },
              {
                "name": "Clear on how to take action",
                "info": "xxxxxbenefit",
                "rating": 1
              },
              {
                "name": "Presentation was well prepared",
                "info": "xxxxxbenefit",
                "rating": 1
              }
            ],
            "reviewerId": "1506531911039",
            "reviewerEmail": "fred.flinstone@gmail.com"
          }
        ],
        "averageReviewReport": [
          {
            "name": "Quality of Information",
            "info": "Did this presentation have quality information on what was being presented?",
            "rating": 1
          },
          {
            "name": "Easy to follow",
            "info": "Did you follow what the speaker was talking about throughout the presentation?",
            "rating": 1
          },
          {
            "name": "Speaker explained things well",
            "info": "Did the speaker explain the main ideas in a clear and understandable way?",
            "rating": 1
          },
          {
            "name": "Visuals were useful",
            "info": "xxxxxbenefit",
            "rating": 1
          },
          {
            "name": "Good examples & demonstration",
            "info": "xxxxxbenefit",
            "rating": 1
          },
          {
            "name": "Value of the presentation is clear",
            "info": "xxxxxbenefit",
            "rating": 1
          },
          {
            "name": "Speaker engaged the audience",
            "info": "xxxxxbenefit",
            "rating": 1
          },
          {
            "name": "Clear on how to take action",
            "info": "xxxxxbenefit",
            "rating": 1
          },
          {
            "name": "Presentation was well prepared",
            "info": "xxxxxbenefit",
            "rating": 1
          }
        ]
      },
      {
        "name": "Bobby",
        "id": 1506531602922,
        "submittedReviews": [
          {
            "reviewItems": [
              {
                "name": "Quality of Information",
                "info": "Did this presentation have quality information on what was being presented?",
                "rating": 5
              },
              {
                "name": "Easy to follow",
                "info": "Did you follow what the speaker was talking about throughout the presentation?",
                "rating": 5
              },
              {
                "name": "Speaker explained things well",
                "info": "Did the speaker explain the main ideas in a clear and understandable way?",
                "rating": 5
              },
              {
                "name": "Visuals were useful",
                "info": "xxxxxbenefit",
                "rating": 5
              },
              {
                "name": "Good examples & demonstration",
                "info": "xxxxxbenefit",
                "rating": 5
              },
              {
                "name": "Value of the presentation is clear",
                "info": "xxxxxbenefit",
                "rating": 5
              },
              {
                "name": "Speaker engaged the audience",
                "info": "xxxxxbenefit",
                "rating": 5
              },
              {
                "name": "Clear on how to take action",
                "info": "xxxxxbenefit",
                "rating": 5
              },
              {
                "name": "Presentation was well prepared",
                "info": "xxxxxbenefit",
                "rating": 5
              }
            ],
            "reviewerId": "1506533598492",
            "reviewerEmail": "bobby@anddigigtal.com"
          },
          {
            "reviewItems": [
              {
                "name": "Quality of Information",
                "info": "Did this presentation have quality information on what was being presented?",
                "rating": 3
              },
              {
                "name": "Easy to follow",
                "info": "Did you follow what the speaker was talking about throughout the presentation?",
                "rating": 3
              },
              {
                "name": "Speaker explained things well",
                "info": "Did the speaker explain the main ideas in a clear and understandable way?",
                "rating": 3
              },
              {
                "name": "Visuals were useful",
                "info": "xxxxxbenefit",
                "rating": 3
              },
              {
                "name": "Good examples & demonstration",
                "info": "xxxxxbenefit",
                "rating": 3
              },
              {
                "name": "Value of the presentation is clear",
                "info": "xxxxxbenefit",
                "rating": 3
              },
              {
                "name": "Speaker engaged the audience",
                "info": "xxxxxbenefit",
                "rating": 3
              },
              {
                "name": "Clear on how to take action",
                "info": "xxxxxbenefit",
                "rating": 3
              },
              {
                "name": "Presentation was well prepared",
                "info": "xxxxxbenefit",
                "rating": 3
              }
            ],
            "reviewerId": "1506532925690",
            "reviewerEmail": "daniel.clain@talktalkplc.com"
          },
          {
            "reviewItems": [
              {
                "name": "Quality of Information",
                "info": "Did this presentation have quality information on what was being presented?",
                "rating": 5
              },
              {
                "name": "Easy to follow",
                "info": "Did you follow what the speaker was talking about throughout the presentation?",
                "rating": 5
              },
              {
                "name": "Speaker explained things well",
                "info": "Did the speaker explain the main ideas in a clear and understandable way?",
                "rating": 5
              },
              {
                "name": "Visuals were useful",
                "info": "xxxxxbenefit",
                "rating": 5
              },
              {
                "name": "Good examples & demonstration",
                "info": "xxxxxbenefit",
                "rating": 5
              },
              {
                "name": "Value of the presentation is clear",
                "info": "xxxxxbenefit",
                "rating": 5
              },
              {
                "name": "Speaker engaged the audience",
                "info": "xxxxxbenefit",
                "rating": 5
              },
              {
                "name": "Clear on how to take action",
                "info": "xxxxxbenefit",
                "rating": 5
              },
              {
                "name": "Presentation was well prepared",
                "info": "xxxxxbenefit",
                "rating": 5
              }
            ],
            "reviewerId": "1506531911039",
            "reviewerEmail": "fred.flinstone@gmail.com"
          }
        ],
        "claimedUserEmails": [
          "bobby@anddigigtal.com"
        ]
      }
    ],
    "dateCreated": "1506531595845"
  }
];
demoReviewItems = [
  {
    "reviewItemId": 111,
    "name": "Quality of Information",
    "info": "Did this presentation have quality information on what was being presented?"
  },
  {
    "reviewItemId": 222,
    "name": "Easy to follow",
    "info": "Did you follow what the speaker was talking about throughout the presentation?"
  },
  {
    "reviewItemId": 333,
    "name": "Speaker explained things well",
    "info": "Did the speaker explain the main ideas in a clear and understandable way?"
  },
  {
    "reviewItemId": 444,
    "name": "Visuals were useful",
    "info": "xxxxxbenefit"
  },
  {
    "reviewItemId": 555,
    "name": "Good examples & demonstration",
    "info": "xxxxxbenefit"
  },
  {
    "reviewItemId": 666,
    "name": "Value of the presentation is clear",
    "info": "xxxxxbenefit"
  },
  {
    "reviewItemId": 777,
    "name": "Speaker engaged the audience",
    "info": "xxxxxbenefit"
  },
  {
    "reviewItemId": 888,
    "name": "Clear on how to take action",
    "info": "xxxxxbenefit"
  },
  {
    "reviewItemId": 999,
    "name": "Presentation was well prepared",
    "info": "xxxxxbenefit"
  }
];


