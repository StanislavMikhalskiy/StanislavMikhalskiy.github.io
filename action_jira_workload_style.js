var action_jira_workload_style_v = '1.0';

var globalStyle = `<style>
table {
 border: solid 1px #333;
 border-collapse: collapse;}
table td {
 padding: 6px 10px;}
table td.caption {
 background: #DDD;
 font-weight: bold;}
table td.normalFreeOne {
 background: #FFFFFF;
 font-weight: bold;}
table td.normalFreeTwo {
 background: #F0F0F0;
 font-weight: bold;}
table td.normalFullOne {
 background: #ccffcc;
 font-weight: bold;}
table td.normalFullTwo {
 background: #99ff99;
 font-weight: bold;}
table td.hardFullOne {
 background: #F6D8CE;
 font-weight: bold;}
table td.hardFullTwo {
 background: #F5BCA9;
 font-weight: bold;}
a.button24 {
    box-sizing: border-box;
    transition: background-color .1s ease-out;
    border-radius: 3.01px;
    border-style: solid;
    border-width: 1px;
    cursor: pointer;
    font-family: inherit;
    font-size: 14px;
    font-variant: normal;
    font-weight: 400;
    background-image: none;
    background-color: rgba(9,30,66,0.08);
    border-color: transparent;
    color: #344563;
    text-decoration: none;
    display: inline-block;
    height: 2.14285714em;
    line-height: 1.42857143em;
    margin: 5px 0;
    padding: 4px 10px;
    vertical-align: baseline;
    white-space: nowrap;
    display:inline-block;
    z-index: 2002;
}
.button24:hover {
   border-top-color: #c4e7ff;
   background: #c4e7ff;
   color: #ccc;
   }
.button24:active {
   border-top-color: #1b435e;
   background: #1b435e;
   }

/**
 * Переключаемая боковая панель навигации
 * выдвигающаяся по клику слева
 */

.nav {
    /*  ширна произвольная, не стесняйтесь экспериментировать */
    width: 620px;
    min-width: 620px;
    /* фиксируем и выставляем высоту панели на максимум */
    height: 100%;
    position: fixed;
    top: 0;
    bottom: 0;
    margin: 0;
    /* сдвигаем (прячем) панель относительно левого края страницы */
    left: -660px;
    /* внутренние отступы */
    padding: 15px 35px 5px 5px;
    /* плавный переход смещения панели */
    -webkit-transition: left 0.3s;
    -moz-transition: left 0.3s;
    transition: left 0.3s;
    /* определяем цвет фона панели */
    background: #16a085;
    /* поверх других элементов */
    z-index: 2000;
}

/**
 * Кнопка переключения панели
 * тег <label>
 */

.nav-toggle {
    /* абсолютно позиционируем */
    position: absolute;
    /* относительно левого края панели */
    left: 660px;
    /* отступ от верхнего края панели */
    top: 1px;
    /* внутренние отступы */
    padding: 0.5em;
    /* определяем цвет фона переключателя
     * чаще вчего в соответствии с цветом фона панели
    */
    background: inherit;
    /* цвет текста */
    color: #dadada;
    /* вид курсора */
    cursor: pointer;
    /* размер шрифта */
    font-size: 1.2em;
    line-height: 1;
    /* всегда поверх других элементов страницы */
    z-index: 2001;
    /* анимируем цвет текста при наведении */
    -webkit-transition: color .25s ease-in-out;
    -moz-transition: color .25s ease-in-out;
    transition: color .25s ease-in-out;
}

/* определяем текст кнопки
 * символ Unicode (TRIGRAM FOR HEAVEN)
*/

.nav-toggle:after {
    content: '\u2630';
    text-decoration: none;
}

/* цвет текста при наведении */

.nav-toggle:hover {
    color: #f4f4f4;
}

/**
 * Скрытый чекбокс (флажок)
 * невидим и недоступен :)
 * имя селектора атрибут флажка
 */

[id='nav-toggle'] {
    position: absolute;
    display: none;
}

/**
 * изменение положения переключателя
 * при просмотре на мобильных устройствах
 * когда навигация раскрыта, распологаем внутри панели
*/

[id='nav-toggle']:checked ~ .nav > .nav-toggle {
    left: auto;
    right: 2px;
    top: 1em;
}

/**
 * Когда флажок установлен, открывается панель
 * используем псевдокласс:checked
 */

[id='nav-toggle']:checked ~ .nav {
    left: 0;
    box-shadow:4px 0px 20px 0px rgba(0,0,0, 0.5);
    -moz-box-shadow:4px 0px 20px 0px rgba(0,0,0, 0.5);
    -webkit-box-shadow:4px 0px 20px 0px rgba(0,0,0, 0.5);
    overflow-y: auto;
}

/*
 * смещение контента страницы
 * на размер ширины панели,
 * фишка необязательная, на любителя
*/

[id='nav-toggle']:checked ~ main > article {
    -webkit-transform: translateX(320px);
    -moz-transform: translateX(320px);
    transform: translateX(320px);
}

/*
 * изменение символа переключателя,
 * привычный крестик (MULTIPLICATION X),
 * вы можете испльзовать любой другой значок
*/

[id='nav-toggle']:checked ~ .nav > .nav-toggle:after {
    content: '\u2715';
}

/**
 * профиксим баг в Android <= 4.1.2
 * см: http://timpietrusky.com/advanced-checkbox-hack
 */

body {
    -webkit-animation: bugfix infinite 1s;
}

@-webkit-keyframes bugfix {
    to {
      padding: 0;
    }
}

/**
 * позаботьтимся о средних и маленьких экранах
 * мобильных устройств
 */

@media screen and (min-width: 320px) {
    html,
    body {
      margin: 0;
      overflow-x: hidden;
    }
}

@media screen and (max-width: 320px) {
    html,
    body {
      margin: 0;
      overflow-x: hidden;
    }
    .nav {
      width: 100%;
      box-shadow: none
    }
}

/**
 * Формируем стиль заголовка (логотип) панели
*/

.nav h2 {
    width: 90%;
    padding: 0;
    margin: 10px 0;
    text-align: center;
    text-shadow: rgba(255, 255, 255, .1) -1px -1px 1px, rgba(0, 0, 0, .5) 1px 1px 1px;
    font-size: 1.3em;
    line-height: 1.3em;
    opacity: 0;
    transform: scale(0.1, 0.1);
    -ms-transform: scale(0.1, 0.1);
    -moz-transform: scale(0.1, 0.1);
    -webkit-transform: scale(0.1, 0.1);
    transform-origin: 0% 0%;
    -ms-transform-origin: 0% 0%;
    -moz-transform-origin: 0% 0%;
    -webkit-transform-origin: 0% 0%;
    transition: opacity 0.8s, transform 0.8s;
    -ms-transition: opacity 0.8s, -ms-transform 0.8s;
    -moz-transition: opacity 0.8s, -moz-transform 0.8s;
    -webkit-transition: opacity 0.8s, -webkit-transform 0.8s;
}

.nav h2 a {
    color: #dadada;
    text-decoration: none;
    text-transform: uppercase;
}


/*плавное появление заголовка (логотипа) при раскрытии панели */

[id='nav-toggle']:checked ~ .nav h2 {
    opacity: 1;
    transform: scale(1, 1);
    -ms-transform: scale(1, 1);
    -moz-transform: scale(1, 1);
    -webkit-transform: scale(1, 1);
}

</style>
`;
