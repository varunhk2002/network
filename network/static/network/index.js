document.addEventListener('DOMContentLoaded', function(){
    console.log("Loaded!!!")
    //var csrftoken = $("[name=csrfmiddlewaretoken]").val();
    let csrftoken = getCookie('csrftoken');
    
    document.querySelector("#postform").addEventListener('submit', function(event){
        event.preventDefault();
        console.log("form submit!!!");
        //csrf_token = document.getElementsByName('csrfmiddlewaretoken')[0].value
        fetch('/new_post/', {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                "X-CSRFToken": csrftoken,
            },
            body: JSON.stringify({
               body: document.querySelector("#text").value,
            }), 
        })  
        .then(response => response.json())
        .then(result => {
            console.log(result)
            index_page()
        })
    })


    function index_page() {
        console.log("page reloading");
        fetch("/", {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                "X-CSRFToken": csrftoken,
            },
            body: "0"
        })
        .then(response => response.json())
        .then(json => {
            //console.log(json)
            let jobj = JSON.parse(json)
            let jobj2 = jobj[0]
            console.log(jobj2['pk'])

            document.querySelector('#text').value = "";

            let updated_date = Date(jobj2['fields']['timestamp'])

            let div_wrap = document.createElement("div")

            let div = document.createElement("div");
            div.className = "allposts";
            div.id = `allposts ${jobj2['pk']}`;
            let heading = document.createElement("h5");
            heading.innerHTML = `${jobj2['fields']['username']}`
            let hrefs = document.createElement('a');
            hrefs.href = "{% url 'network:profile' post.username %}";
            heading.appendChild(hrefs);
            //heading.href = "{% url 'network:profile' post.username %}";
            div.appendChild(heading);
            let date = document.createElement("p");
            date.innerHTML = `${updated_date}`
            div.appendChild(date);
            let content = document.createElement("p");
            content.id = `content ${jobj2['pk']}`
            content.innerHTML = `${jobj2['fields']['content']}`
            div.appendChild(content);
            let edit = document.createElement("a");
            edit.text = "EDIT";
            //edit.href = "#";
            edit.role = 'button';
            edit.id = `${jobj2['pk']}`;
            edit.classList = "edit_links btn btn-info";
            edit.addEventListener('click', function(event) {
                edit_post(event);
            })
            div.appendChild(edit);

            div_wrap.appendChild(div)

            let br = document.createElement("br")

            div_wrap.appendChild(br)

            let post_lists = document.getElementById("post_divs");
            post_lists.insertBefore(div_wrap, post_lists.children[0]);
            
            
        })
    }

    var editLinkVal = document.getElementsByClassName('edit_links');
    for(i=0; i<editLinkVal.length; i++) {
        editLinkVal[i].addEventListener("click", function (event){
            edit_post(event)
        });
    }

    function edit_post(event) {
        console.log("link clicked!!!");
        console.log(event.target.id);
        //var canceledit = document.getElementsByClassName()
        let edit_event = event.target.id;
        var prefill_content = document.getElementById(`content ${event.target.id}`).innerHTML;
        console.log(prefill_content);
        document.getElementById(`content ${event.target.id}`).style.display = 'none';
        document.getElementById(`${event.target.id}`).remove();
        let form = document.createElement('form');
        form.method = 'POST';
        form.id = `editform ${event.target.id}`;
        //let actions = '{% url "network:editform" %}'
        //form.action = '/editform/';
        let csrf_text = document.createElement("input");
        csrf_text.type = "hidden";
        let csrftoken = getCookie('csrftoken');
        csrf_text.name = 'csrfmiddlewaretoken';
        csrf_text.value = `${csrftoken}`;
        form.appendChild(csrf_text);
        let textarea = document.createElement('textarea');
        textarea.cols = "100";
        textarea.className = "form-control";
        textarea.name = "text2";
        textarea.id = "edittext";
        textarea.value = prefill_content;
        form.appendChild(textarea);
        let br = document.createElement("br");
        form.appendChild(br);
        let id_hidden = document.createElement('input');
        id_hidden.type = 'hidden';
        id_hidden.value = `${event.target.id}`;
        id_hidden.id = "updated_post_id";
        id_hidden.name = "updated_post_name";
        form.appendChild(id_hidden);
        let update_sub = document.createElement("input");
        update_sub.value = "Update Post";
        update_sub.className = "btn btn-primary";
        update_sub.type = "submit";
        update_sub.id = "update_sub";
        form.appendChild(update_sub);
        form.addEventListener('submit', function(event) {
            event.preventDefault();
            console.log("edit form submitted!!!");
            edit_form(event, edit_event);
        });
        

        document.getElementById(`allposts ${event.target.id}`).appendChild(form);

        let edit_cancel = document.createElement("a");
        edit_cancel.text = "Cancel";
        edit_cancel.classList = "cancels btn btn-link";
        edit_cancel.id = `cancel_edit ${event.target.id}`;
        let target_id = event.target.id;
        edit_cancel.addEventListener('click', function(){
                 cancel_edit(target_id);
         })
         document.getElementById(`allposts ${event.target.id}`).appendChild(edit_cancel);

        // //event.preventDefault();

    }


    
    function edit_form(event, id) {
        fetch(`/editform/${id}/`, {
            method: 'PUT',
            credentials: 'same-origin',
            headers: {
                "X-CSRFToken": csrftoken,
            },
            body: JSON.stringify({
                body: document.querySelector('#edittext').value
            }),
        })
        .then(response => response.json())
        .then(json => {
            document.getElementById(`cancel_edit ${json.id}`).remove();
            let updated_data = json.data;
            let updated_timestamp = json.timestamp;
            document.getElementById(`editform ${json.id}`).remove();
            // let p_timestamp = document.createElement("p");
            // p_timestamp.id = "timestamp";
            // let bold_timestamp = document.createElement("b");
            // bold_timestamp.innerHTML = updated_timestamp;
            // p_timestamp.appendChild(bold_timestamp);
            let allposts = document.getElementById(`allposts ${id}`);
            // allposts.appendChild(p_timestamp);
            let p_content = document.getElementById(`content ${json.id}`)
            p_content.style.display = 'block';
            p_content.innerHTML = updated_data;
            allposts.appendChild(p_content);
            let editbtn = document.createElement("a");
            editbtn.classList = "edit_links btn btn-info";
            editbtn.id = `${id}`;
            editbtn.text = "EDIT";
            editbtn.role = "button";
            allposts.addEventListener('click', function(event) {
                edit_post(event);
            })
            allposts.appendChild(editbtn);
            
        })

    }

    function cancel_edit(id) {
        document.getElementById(`editform ${id}`).remove();
        document.getElementById(`cancel_edit ${id}`).remove();
        document.getElementById(`content ${id}`).style.display = 'block';
        //document.getElementById(`${id}`).style.display = 'block';
        let edit = document.createElement("a");
            edit.text = "EDIT";
            //edit.href = "#";
            edit.role = 'button';
            edit.id = `${id}`;
            edit.classList = "edit_links btn btn-info";
            edit.addEventListener('click', function(event) {
                edit_post(event);
            })
        document.getElementById(`allposts ${id}`).appendChild(edit);

    }



    var likelinkval = document.getElementsByClassName('like-unlike');
    for(i=0; i<likelinkval.length; i++) {
        likelinkval[i].addEventListener("click", function (event){
            console.log('like button clicked!');
        });
    }

   
    function like() {
        
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


    
});