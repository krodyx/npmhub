// Escape HTML
function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// Are we on a GitLab instance ?
const isGitLab = !!document.querySelector('.navbar-gitlab');
// Are we on a repo page that has a package.json?
const packageLink = document.querySelector('.files [title="package.json"], .tree-item-file-name [title="package.json"]');

if (packageLink) {
  const pkgUrl = packageLink.href;

  // Set up list containers and headings
  const $template = $('#readme, .readme-holder').clone().empty().removeAttr('id');

  const $depsList = $("<ol class='deps markdown-body'>");
  const $devDepsList = $("<ol class='deps markdown-body'>");
  const $depsVisBtn = $("<button class='btn btn-sm viz-btn' style='float: right; margin: 5px 5px 0 0;' type='button'>Dependency tree visualization");

  const dependenciesHeader    = isGitLab ? '<div id="dependencies" class="file-title"><strong>Dependencies'         : '<h3 id="dependencies">Dependencies';
  const devDependenciesHeader = isGitLab ? '<div id="dev-dependencies" class="file-title"><strong>Dev dependencies' : '<h3 id="dev-dependencies">Dev dependencies';

  $template.clone()
  .append($depsVisBtn)
  .append(dependenciesHeader, $depsList)
  .appendTo('.repository-content, .tree-content-holder');

  $template.clone()
  .append(devDependenciesHeader, $devDepsList)
  .appendTo('.repository-content, .tree-content-holder');

  fetch(pkgUrl, { credentials: 'include' }).then(res => res.text()).then(domStr => {
    const pkg = JSON.parse($(domStr).find('.blob-wrapper, .blob-content').text());
    $depsVisBtn.wrap(`<a href="http://npm.anvaka.com/#/view/2d/${esc(pkg.name)}"></a>`);
    addDependencies(pkg.dependencies, $depsList);
    addDependencies(pkg.devDependencies, $devDepsList);
  });

  function addDependencies(dependencies, $list) {
    if (!dependencies || !Object.keys(dependencies).length) {
      return $list.append("<li class='empty'>None found in package.json</li>");
    }

    Object.keys(dependencies).forEach(name => {
      const depUrl = 'https://registry.npmjs.org/' + name
      const $dep = $(`<li><a href='http://ghub.io/${esc(name)}'>${esc(name)}</a>&nbsp;</li>`)
      $dep.appendTo($list);
      backgroundFetch(depUrl).then(dep => {
        $dep.append(dep.description)
      })
    });
  }
}
