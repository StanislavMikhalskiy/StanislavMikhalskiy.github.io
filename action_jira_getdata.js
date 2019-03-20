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
