(function($) {
  $.fn.easyTabs = function(option) {
    const param = jQuery.extend(
      { fadeSpeed: `fast`, defaultContent: 1, activeClass: `active` },
      option
    )
    $(this).each(function() {
      const thisId = `#${this.id}`
      if (param.defaultContent == ``) {
        param.defaultContent = 1
      }
      if (typeof param.defaultContent === `number`) {
        var defaultTab = $(
          `${thisId} .tabs li:eq(${param.defaultContent - 1}) a`
        )
          .attr(`href`)
          .substr(1)
      } else {
        var defaultTab = param.defaultContent
      }
      $(`${thisId} .tabs li a`).each(function() {
        const tabToHide = $(this).attr(`href`).substr(1)
        $(`#${tabToHide}`).addClass(`easytabs-tab-content`)
      })
      hideAll()
      changeContent(defaultTab)
      function hideAll() {
        $(`${thisId} .easytabs-tab-content`).hide()
      }
      function changeContent(tabId) {
        hideAll()
        $(`${thisId} .tabs li`).removeClass(param.activeClass)
        $(`${thisId} .tabs li a[href=#${tabId}]`)
          .closest(`li`)
          .addClass(param.activeClass)
        if (param.fadeSpeed != `none`) {
          $(`${thisId} #${tabId}`).fadeIn(param.fadeSpeed)
        } else {
          $(`${thisId} #${tabId}`).show()
        }
      }
      $(`${thisId} .tabs li`).click(function() {
        const tabId = $(this).find(`a`).attr(`href`).substr(1)
        changeContent(tabId)
        return false
      })
    })
  }
})(jQuery)
