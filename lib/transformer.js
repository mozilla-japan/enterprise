var Transformer = (function(Transformer){

  var cheerio = require('cheerio');
  var Entities = require('html-entities').AllHtmlEntities;
  var entities = new Entities();
  var toArray = require('to-array');

  var marked = require('marked');
  marked.setOptions({gfm: false});

  function cleanup(markdown){
    markdown = markdown.replace(/\{\#(.+?)\}/g, '<a name="$1"'
                                + ''
                                + ' class="anchor-substitution"></a>');
    markdown = markdown.replace(/<!--[\s\S]*?-->/g, '');

    return markdown;
  }

  function toHTML(markdown){
    var html = marked(cleanup(markdown));
    return cheerio.load(html);
  }

  function tableOfContents($){
    var toc = {};
    $('h1').each(function(idx, h1) {
      var $h1 = $(h1);
      var $chunk =
            $h1.nextUntil('h1').add(h1);
      $chunk.find('[name]').each(function(){
        toc["#" + $(this).attr("name")] = idx;
      });
    });
    return toc;
  }

  function substituteAnchors($){
    $('h3 .anchor-substitution')
      .each(function() {
        var $this = $(this);
        var currentName = $this.attr('name');
        $this.parent().attr('name', currentName);
        $this
          .parent('[id*=' + currentName + ']')
          .attr('id', currentName)
          .removeAttr('name');
      })
      .remove();
    return $;
  }

  function generateId(){
    return ("" + (new Date()).valueOf() + Math.random())
      .replace(/\./, "");
  }

  function unsafe($, toc, title, ids){
    var getContent = function(questionIndex, questionTitleElement) {
      var $questionTitle = $(questionTitleElement);
      var $content = $questionTitle.nextUntil('h2', ':not(h1)');

      $content.find('a[href^=#]').each(function() {
        var $this = $(this);
        var origHref = $this.attr('href');
        var pageNum = toc[origHref];
        if (pageNum !== undefined) {
          $this.attr(
            'href',
            '/business/faq/tech/' + ids[pageNum] + '/' + origHref
          );
        }
      });

      var $keywords = $content.first();
      if ($keywords.text().indexOf('キーワード') !== -1) {
        var words = $keywords.text().split('：')[1].split('、');

        var keywordHtml = words.reduce(function(html, word, idx) {
          html += '<span class="keyword">' + word.trim() + '</span>';
          if (idx < words.length - 1) {
            html += '<span class="slash"> / <span>';
          }
          return html;
        }, 'キーワード ');

        $keywords
          .addClass('keywords')
          .html(keywordHtml);
      }

      var content = $('<div></div>').append($content).html();

      var specialCharsEntity = ['&amp;', '&lt;', '&gt;', '&quot;', '&#39;'];

      var TMP_PREFIX = '_åTEMPå_';

      specialCharsEntity.forEach(function(char, index) {
        content = content.replace(new RegExp(char, 'g'), TMP_PREFIX + index);
      });

      content = entities.decode(content);

      specialCharsEntity.forEach(function(char, index) {
        content = content.replace(new RegExp(TMP_PREFIX + index, 'g'), char);
      });

      return {
        title: entities.decode($questionTitle.html()),
        name: $questionTitle.attr('name'),
        content: content
      };
    };

    var categories = $('h1').map(function(idx, h1) {
      var $h1 = $(h1);
      var categoryTitle = entities.decode($h1.html());
      var $contents = $h1.nextUntil('h1');
      var items = $contents.filter('h2').map(getContent);

      return {
        title: categoryTitle,
        id: ids[idx] || generateId(),
        // because cheerio's .map() returns a cheerio object, not a plane array
        items: toArray(items)
      };
    });

    return {
      title: title,
      categories: toArray(categories)
    };
  }

  Transformer.transform = function(markdown, title, ids){
    var $ = toHTML(markdown);
    var toc = tableOfContents($);
    $ = substituteAnchors($);
    return unsafe($, toc, title, ids);
  };

  return Transformer;
})(Transformer || {});

module.exports = Transformer;
