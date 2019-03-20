var action_jira_workload_v = '1.0';

function GetFutureSprintSmart(flevel){
    var f = flevel+'- ';
    console.log(f+'GetFutureSprintSmart - Запуск функции');
    // если мы уже запрашивали спринт в этой сессии и у нас есть его значение, то повторно запрашивать не будем
    if (futureSprint.length == 0) {
        console.log(f+'Спринт еще не был определен');
        functionResponse = JiraGetFutureSprint(boardId,f);
        if (functionResponse.state) {
            futureSprint = functionResponse.value;
            console.log(f+'Спринт определен успешно: '+futureSprint);
            console.log(f+'GetFutureSprintSmart - завершение работы функции');
            return true;
        } else {
            errorMessage += "<p>Спринт не был определен</p>";
            errorMessage += "<p>"+functionResponse.errorMsg+"</p>";
            console.log(f+'Информация об ошибке: '+functionResponse.errorMsg);
            console.log(f+'GetFutureSprintSmart - завершение работы функции');
            return false;
        }
    } else {
        console.log(f+'Спринт уже был определен: '+futureSprint);
        console.log(f+'GetFutureSprintSmart - завершение работы функции');
        return true;
    }
    
    console.log(f+'GetFutureSprintSmart - завершение работы функции');
    return false;
}
