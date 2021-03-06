var action_jira_getdata_v = '1.0';

function JiraGetFutureSprint(value,flevel){
    var f = flevel+'- ';
    console.log(f+'JiraGetFutureSprint - Запуск функции');
    console.log(f+'boardId = '+value);
    var localFunctionResponse = {value:"",state:false,errorMsg:""},
        localURL = jGetSprint+value+"/sprint?state=future";

    var jqxhr = $.ajax({
    url: localURL,
    type: "GET",
    success: function(jqdata) {
      console.log(f+'Запрос успешно отработал');
      if (jqdata.values.length==1) {
          localFunctionResponse.state = true;
          localFunctionResponse.value = jqdata.values[0].name;
      } else
      {
          if (jqdata.values.length==0) {
              localFunctionResponse.errorMsg = "Не найдено ни одного 'будущего' спринта";
          } else {
              localFunctionResponse.errorMsg = "Найдено более одного 'будущего' спринта";
          }
      }
    },
    async:false
    })
    //.done(function() { result="second success"; })
    .fail(function(errmsg) { console.log(f+'Ошибка обработки '+errmsg.responseText); })
    //.always(function() { result="finished"; });
    ;
    console.log(f+'JiraGetFutureSprint - завершение работы функции');
    
    return localFunctionResponse;
}

function GetTimeToWork(value,v_googleTabName,flevel){
    var f = flevel+'- ';
    console.log(f+'GetTimeToWork - Запуск функции');
    var localFunctionResponseArray = {value:[],state:false,errorMsg:""},
        sprint = value,
        URL = "https://script.google.com/macros/s/AKfycbwJ8QiZKAyFVpjFbF037JQ6UmDaaq_SGPlu1eANAK9eHpEMjV0/exec?sprint="+sprint+"&team="+v_googleTabName;
    console.log(f+'URL = '+URL);
    var jqxhr = $.ajax({
    url: URL,
    type: "GET",
    success: function(jqdata) {
        console.log(f+'Запрос успешно отработал, jqdata.length = '+jqdata.length);
        if (jqdata.length > 0) {
            localFunctionResponseArray.state = true;
            localFunctionResponseArray.value = jqdata;
        } else {
            localFunctionResponseArray.state = false;
            localFunctionResponseArray.errorMsg = "Данные по планируемой загрузке не найдены, проверьте имя спринта или наличие данных ("+URL+")";
        }
    },
    async:false
    })
    //.done(function() { result="second success"; })
    .fail(function(errmsg) {
        console.log(f+'Ошибка обработки '+errmsg.responseText);
        localFunctionResponseArray.errorMsg = "Ошибка получения данных по url "+URL;
    })
    //.always(function() { result="finished"; });
    ;
    
    console.log(f+'GetTimeToWork - завершение работы функции');
    return localFunctionResponseArray;
}

function GetSprintWorkload(value,flevel){
    var f = flevel+'- ';
    console.log(f+'GetSprintWorkload - Запуск функции');
    var localFunctionResponseArray = {value:[],state:false,errorMsg:""};
    var taskdata = {
        "jql": "project = "+projectID+" and Sprint in ('"+value+"') and status not in (Closed)",
        "startAt": 0,
        "maxResults": 500,
        "fields": [
            "fixVersions",
            "customfield_11303",
            "customfield_11304",
            "timeestimate",
            "timeoriginalestimate",
            "timetracking",
            "assignee"
        ]
    };
    var parameters = JSON.stringify(taskdata);
    var req = $.ajax({
        url: jiraURL+jFindURL,
        type: "POST",
        data: parameters,
        contentType: 'application/json',
        dataType: 'json',
        async: false,
        processData: false,
        beforeSend: function(xhr, settings) {
            xhr.setRequestHeader('Content-Type', 'application/json')
        },
        error: function (errmsg) {
            console.log(f+'Ошибка: ' + errmsg.responseText + " " + parameters);
            localFunctionResponseArray.errorMsg = "GetSprintWorkload - Ошибка выполнения запроса";
        },
        success: function (data) {
            console.log(f+'Запрос успешно отработал '+jiraURL+jFindURL+" "+taskdata);
            if ("total" in data) {
                if (data.total>0) {
                    localFunctionResponseArray.state = true;
                    localFunctionResponseArray.value = data;
                } else {
                    localFunctionResponseArray.errorMsg = "В спринт '"+value+"' еще не запланированы задачи";
                    console.log(f+'В спринт "'+value+'" еще не запланированы задачи');
                }
            } else {
                console.log(f+'Параметр "total" не найден в ответе');
                localFunctionResponseArray.errorMsg = "GetSprintWorkload - Ошибка выполнения запроса. Параметр 'total' не найден в ответе";
            }
        }
        });

    console.log(f+'GetSprintWorkload - завершение работы функции');
    return localFunctionResponseArray;
}
