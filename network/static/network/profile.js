document.addEventListener('DOMContentLoaded', function() {
    console.log("pageloaded");
    let csrftoken = getCookie('csrftoken');
    

    // document.querySelector('#unfollow_button').addEventListener('click', function(event) {
    //     unfollow(event)
    //     //console.log("btn clicked")
    // })

    document.querySelector('.btn').addEventListener('click', function(event) {
        event.preventDefault();
        event_id = event.target.id
        if(event_id == "follow_button") {
            let tofollow = this.getAttribute('data-tofollow')
            follow(event, tofollow)
        }
        else {
            let tounfollow = this.getAttribute('data-tounfollow');
            unfollow(event, tounfollow)
        }
        
    })

    function follow(event, tofollow) {
        console.log('follow button clicked');
        //let tofollow = this.getAttribute('data-tofollow');
        fetch('/follow/', {
            method: 'POST',
            credentials: "same-origin",
            headers: {
                "X-CSRFToken": csrftoken,
            },
            body: JSON.stringify({
                body: tofollow
            })
        })
        .then(response => response.json)
        .then(json => {
            console.log("backend connected")
            document.querySelector('#follow_button').remove();
            let unfollowb = document.createElement("button");
            unfollowb.className = "btn btn-danger";
            unfollowb.type = "button";
            unfollowb.id = "unfollow_button";
            unfollowb.dataset.tounfollow = tofollow;
            unfollowb.innerHTML = "Unfollow";
            unfollowb.addEventListener('click', function(event) {
                console.log('unfollow clicked');
                unfollow(event, tofollow)
            })
            document.querySelector('#profile').appendChild(unfollowb);
        })
    }

    

    function unfollow(event, tounfollow) {
        console.log('unfollow clicked');
        event.preventDefault();
        console.log(tounfollow)
        fetch('/unfollow/', {
            method: 'DELETE',
            credentials: "same-origin",
            headers: {
                "X-CSRFToken": csrftoken,
            },
            body: JSON.stringify({
                body:tounfollow
            })
        })
        .then(response => response.json)
        .then(result => {
            console.log("unfollow backend connected.")
            console.log(result)
            document.querySelector('#unfollow_button').remove();
            let followb = document.createElement("button");
            followb.className = "btn btn-primary";
            followb.type = "button";
            followb.id = "follow_button";
            followb.dataset.tounfollow = tounfollow;
            followb.innerHTML = "Follow";
            followb.addEventListener('click', function(event) {
                follow(event, tounfollow)
            })
            document.querySelector('#profile').appendChild(followb);
        })
    }
    



    function getCookie(cname) {
        var name = cname + "=";
        var ca = document.cookie.split(';');
        for(var i=0; i<ca.length; i++) {
           var c = ca[i];
           while (c.charAt(0)==' ') c = c.substring(1);
           if(c.indexOf(name) == 0)
              return c.substring(name.length,c.length);
        }
        return "";
   }
})