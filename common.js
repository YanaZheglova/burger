"use strict"

// До загрузки DOM определяем, открыта страница тач скрином или мышью:
const isMobile = {
  Android: function () {
    return navigator.userAgent.match(/Android/i);
  },
  BlackBerry: function () {
    return navigator.userAgent.match(/BlackBerry/i);
  },
  iOS: function () {
    return navigator.userAgent.match(/iPhone|iPad|iPod/i);
  },
  Opera: function () {
    return navigator.userAgent.match(/Opera Mini/i);
  },
  Windows: function () {
    return navigator.userAgent.match(/IEMobile/i);
  },
  any: function () {
    return (
      isMobile.Android() ||
      isMobile.BlackBerry() ||
      isMobile.iOS() ||
      isMobile.Opera() ||
      isMobile.Windows()
    );
  }
};

// Если страница открыта на мобильном, для пункта меню,
// имеющего подменю, делаем стрелку в виде треугольника,
// а body добавляе идентификаторы, на каком устройстве
// открыто - классы _touch или _pc
if(isMobile.any()){
  document.body.classList.add('_touch');
  let menuArrows = document.querySelectorAll('.menu__arrow');
  if(menuArrows.length > 0){
    for(let i = 0; i < menuArrows.length; i++){
      const menuArrow = menuArrows[i];
      menuArrow.addEventListener('click', function(e) {
        menuArrow.parentElement.parentElement.classList.toggle('_active');
      });
    }
  }
} else {
  document.body.classList.add('_pc');
}

// Продолжаем после полной загрузки DOM
document.addEventListener('DOMContentLoaded', function(){

//---------------------------------------------------------------
//---------------------------------------------------------------

  // При клике на кнопку меню Бургер - открытие, закрытие меню,
  // закрытие меню - при клике на пункт меню - в функции
  // function onMenuLinkClick(e) в function scrollingSections()
  // если изменения при скролле не нужны, корректируем код.

  const iconMenu = document.querySelector('.menu__icon');
  const menuBody = document.querySelector('.menu__body');
  if(iconMenu){
    iconMenu.addEventListener('click', function(e) {
      document.body.classList.toggle('_lock');
      iconMenu.classList.toggle('_active');
      menuBody.classList.toggle('_active');
    });
  }

  // Закрытие меню при ресайзе окна на больших экранах
  function closingTheMenuWhenResizing() {
    window.addEventListener('resize', function(e) {
      //windowWidth >= 768
      if(window.matchMedia('(min-width: 768px)').matches){
        document.body.classList.remove('_lock');
        iconMenu.classList.remove('_active');
        menuBody.classList.remove('_active');
      }
    });
  }

  // При наведении на пункты меню с раскрывающимися
  // подменю, у меню появляется прокрутка,
  // которая сдвигает меню влево, из-за чего оно
  // дергается (на меленьких экранах)
  // Убираем этот баг:
  const menuList = document.querySelector('.menu__list');
  const menuItems = document.querySelectorAll('.menu__item');
  const body = document.querySelector('body');

  // При наведении мыши на пункты меню,
  // паддинг у menu__body уменьшаем на ширину появляющегося скролла
  function menuItemsMouseEnter(e) {
    if(window.matchMedia('(max-width: 768px)').matches) {
      let currentItem = e.target;
      let sub = currentItem.querySelector('.menu__sub-list');
      // 60 - это паддинги справа и слева у .menu-body из css
      // находим ширину скролла
      const lockPaddingValue = menuBody.offsetWidth - 60 - menuList.offsetWidth;
      if(sub){
        // 30 - это паддинг справа у .menu-body из css
        menuBody.style.paddingRight = 30 - lockPaddingValue + 'px';
      }
    }
  }

  // При убиронии мыши от пункта меню, скролл для меню исчезает
  // и паддинг у .menu-body делаем прежним.
  function menuItemsMouseLeave(e) {
    if(window.matchMedia('(max-width: 768px)').matches){
      let currentItem = e.target;
      let sub = currentItem.querySelector('.menu__sub-list');
      if(sub){
        menuBody.style.paddingRight = '30px';
      }
    }
  }

  // Слешаем пункты меню на наведение и убирание мыши
  function removeTheScrollBug () {
    if(menuItems.length > 0){
      for(let i = 0; i < menuItems.length; i++){
        menuItems[i].addEventListener('mouseenter', menuItemsMouseEnter);
        menuItems[i].addEventListener('mouseleave', menuItemsMouseLeave);
      } //------- end for ---------
    } //------- end if(menuItems.length > 0){ ---------
  } //------- end function removeTheScrollBug () ---------

// На тач устройтве проблемы со скролом не было,
// и предполагается, что ресайз до исчезновения бургера
// пользователь будет делать на больших экранах, поэтому
// данные функции применяем к body._pc
  if(body.classList.contains('_pc')){
    removeTheScrollBug();
    closingTheMenuWhenResizing();
  }

// ----------------------------------------------------------------
// ----------------------------------------------------------------

  // Плавная прокрутка до секции при клике на меню,
  // смена активного пункта меню при скролле страницы
  // и при клике на меню.
  (function scrollingSections() {
    const menuLinks = document.querySelectorAll('.menu__link[data-goto]');
    const menuSubLinks = document.querySelectorAll('.menu__sub-link[data-goto]');
    const header = document.querySelector('.header');

    // Функция для удаления класса _active
    function removeActiveClasses(linksArr) {
      for(let i = 0; i < linksArr.length; i++){
        linksArr[i].classList.remove('_active');
      }
    }

    // Функция для определения активного пункта меню
    // в зависимости от положения секций на странице
    function activeClassDefinition(link) {
      let section = document.querySelector(link.dataset.goto);
      let sectionHeight = section.offsetHeight;
      let topPoint = section.getBoundingClientRect().top - header.offsetHeight;
      let lowerPoint = section.getBoundingClientRect().top + sectionHeight - header.offsetHeight;
      // Если надо, чтобы пункт меню становился активным чуть раньше,
      // чем его верх достигнет header, например, если у предыдущих секций очень
      // большие паддинги, то это расстояние указываем в атрибуте data-offset у секции.
      // offsetToSection - из атрибута data-offset - это расстояние
      // от верха блока и выше, чтобы блок становился активным чуть раньше,
      // offsetFromBottom - из атрибута data-offset-from-bottom - это расстояние
      // от низа блока и выше, чтобы блок становился неактивным чуть раньше.
      let offsetToSection = 0;
      let offsetFromBottom = 0;
      // если у секции есть атрибут data-offset
      if(section.dataset.offset){
        offsetToSection = section.dataset.offset;
      }
      // если у секции есть атрибут data-offset-from-bottom
      if(section.dataset.offsetFromBottom){
        offsetFromBottom = section.dataset.offsetFromBottom;
      } else {
        if(section.dataset.offset){
          offsetFromBottom = offsetToSection;
        }
      }
      if(topPoint <= offsetToSection && lowerPoint > offsetFromBottom){
        link.classList.add('_active');
      }
    } //------- end function activeClassDefinition

    // Определяем активный пункт меню
    function activeMenuLink(linksArr) {
      if(linksArr.length > 0){
        for(let i = 0; i < linksArr.length; i++){
          activeClassDefinition(linksArr[i]);
        }
      }
    }

    function doActiveMenuLink() {
      removeActiveClasses(menuLinks);
      removeActiveClasses(menuSubLinks);
      activeMenuLink(menuLinks);
      activeMenuLink(menuSubLinks);
    }

    // При загрузке страницы
    doActiveMenuLink();

    // При скролле
    window.addEventListener('scroll', doActiveMenuLink);

    // Функция для плавной прокрутки при клике на меню
    function onMenuLinkClick(e){
      const menuLink = e.target;
      // Проверяем, заполнен ли атрибут data-goto и существует ли объект,
      // на который ссылается данный дата-атрибут.
      // .getBoundingClientRect().top - положение элемента на странице в px
      // pageYOffset - высота прокрутки, .offsetHeight - элемента
      if (menuLink.dataset.goto && document.querySelector(menuLink.dataset.goto)) {
        const goToBlock = document.querySelector(menuLink.dataset.goto);
        const goToBlockValue = goToBlock.getBoundingClientRect().top + pageYOffset - header.offsetHeight;

        // При клике на меню, открытом кнопкой бургер
        if(iconMenu.classList.contains('_active')){
          document.body.classList.remove('_lock');
          iconMenu.classList.remove('_active');
          menuBody.classList.remove('_active');
        }

        window.scrollTo({
          top: goToBlockValue,
          behavior: 'smooth',
        });
        e.preventDefault();
      } //------- end if
    }   //------- end function onMenuLinkClick(e)

    // Слушаем клики по меню
    function listenLinks(links) {
      if(links.length > 0){
        links.forEach(link => {
          // Удаляем у всех пунктов и подпунктов класс _active
          link.addEventListener('click', function (e) {
            removeActiveClasses(document.querySelectorAll('[data-goto]'));
          });
          // Плавный скролл до выбранной секции
          link.addEventListener('click', onMenuLinkClick);
          // Пункт, по которому кликаем, делаем активным.
          // Для подменю в HTML добавляем data-parent=".класс пункта основного меню"
          // для идентификации.
          link.addEventListener('click', function(e) {
            if(e.target.dataset.parent){
              // Подменю
              e.target.classList.add('_active');
              // Родитель в меню для подменю
              document.querySelector(e.target.dataset.parent).classList.add('_active');
            } else {
              // Меню
              e.target.classList.add('_active');
            }
          });
          // Чтобы активация меню при скролле не мешала при клике
          link.addEventListener('click', function(e) {
            window.removeEventListener('scroll', doActiveMenuLink);
            setTimeout(function () {
              window.addEventListener('scroll', doActiveMenuLink);
            }, 800);
          });
        }); //------- end links.forEach
      } //------- end if(links.length > 0)
    } //------- end function listenLinks(links)

    listenLinks(menuLinks);
    listenLinks(menuSubLinks);

  })(); //------- end function scrollingSections()

//----------------------------------------------------------------------
//----------------------------------------------------------------------




}); //------- end document.addEventListener('DOMContentLoaded', function(){ ---------
