      //Options
      const CLIENT_ID = '1016061161768-4c5n9je63cj340pm8gvq81a16lnc3tst.apps.googleusercontent.com'; 

      // Array of API discovery doc URLs for APIs used by the quickstart
      const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest"];

      // Authorization scopes required by the API. If using multiple scopes,
      // separated them with spaces.
      const SCOPES = 'https://www.googleapis.com/auth/youtube.readonly';

      const authorizeButton = document.getElementById('authorize-button');
      const signoutButton = document.getElementById('signout-button');
      const content = document.getElementById('content');
      const channelForm = document.getElementById('channel-form');
      const channelInput = document.getElementById('channel-input');
      const videoContainer = document.getElementById('video-container');

      const defaultChannel = 'techguyweb';

      // From submit and change channel
      channelForm.addEventListener('submit', e => {
        e.preventDefault();

        const channel = channelInput.value;

        getChannel(channel);
      }); 

      //Load auth2 library
      function handleClientLoad(){
          gapi.load('client:auth2', initClient);
      }

      //Init API client library and setup sign listeners
      function initClient() {
          gapi.client.init({
            discoveryDocs: DISCOVERY_DOCS,
            clientId: CLIENT_ID,
            scope: SCOPES
          }).then(()=> {
              //Listen for sign in state changes
                gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
              //Handle initial sign in state
              updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
              //funct
              authorizeButton.onclick = handleAuthClick;
              signoutButton.onclick = handleSignoutClick;

          });
      }

      //Update UI sign in State changes
      function updateSigninStatus (isSignedIn){
        if(isSignedIn) {
            authorizeButton.style.display = 'none';
            signoutButton.style.display = 'block';
            content.style.display = 'block';
            videoContainer.style.display = 'block';

            getChannel(defaultChannel);
        }else {
            authorizeButton.style.display = 'block';
            signoutButton.style.display = 'none';
            content.style.display = 'none';
            videoContainer.style.display = 'none';
        }
      }

      //Handle Login
      function handleAuthClick() {
        gapi.auth2.getAuthInstance().signIn();
      }

      //Handle Log out
      function handleSignoutClick() {
        gapi.auth2.getAuthInstance().signOut();
      }

      //Display channel data
      function showChannelData(data) {
        const channelData = document.getElementById('channel-data');
        channelData.innerHTML = data;
      }


      //Get channel from API
     function getChannel(channel) {
        gapi.client.youtube.channels.list({
          part: 'snippet, contentDetails,statistics',
          forUsername: channel
        })
        .then(response => {
          console.log(response);
          const channel = response.result.items[0];

          const output = `
          <ul class="collection">
            <li class="collection-item">Title: ${channel.snippet.title}</li>
            <li class="collection-item">ID: ${channel.id}</li>
            <li class="collection-item">Subscriber: ${numberWithCommas(channel.statistics.subscriberCount)}</li>
            <li class="collection-item">Views: ${numberWithCommas(channel.statistics.viewCount)}</li>
            <li class="collection-item">Videos: ${numberWithCommas(channel.statistics.videoCount)}</li>
          </ul>
          <p>${channel.snippet.description}</p>
          <hr>
          <a class="btn grey darken-2 target="_blank" href="https://youtube.com/${channel.snippet.customUrl}">Visit Channel</a>
          `;
          showChannelData(output);

          const playListId = channel.contentDetails.relatedPlaylist.uploads;
          requestVideoPlaylist(playListId);
        })
        .catch(err => alert('No Channel By that Name'));
     }

     //add commas to number (100,000,000)
     function numberWithCommas (x) {
      return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
     }

     function requestVideoPlaylist(playListId){
        const requestOptions = {
          playlsitId,
          part: 'snippet',
          maxresults: 10
        }
        const request = gapi.client.youtube.playlistItems.list(requestOptions);

        request.execute(response => {
          const playlistItems = response.result.items;
          if(playlistItems){
            let output = '<h4 class="center-align">Latest Videos</h4>';

            //Loop through videos append output
            playlistItems.forEach(item => {
              const videoId = item.snippet.resourcesId.videoId;

              output += `
                <div class="col s3">
                <iframe width="100%" height="auto" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
                </div>
              `;
            });

            //Output videos
            videoContainer.innerHTML = output;

          }else{
            videoContainer.innerHTML = 'No Uploaded Videos';
          }
        });
     }
