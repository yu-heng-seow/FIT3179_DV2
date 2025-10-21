const stateDropdown = document.getElementById('stateFilter');
let mapView, donutView;

// Remove any embedded dropdowns from Vega specs
function removeInternalDropdown(spec) {
  if (!spec || !Array.isArray(spec.params)) return spec;
  spec.params.forEach(param => {
    if (param && param.name === 'state_selection') delete param.bind;
  });
  return spec;
}

// Apply state filter to both charts
function applyFilter(stateValue) {
  const selected = stateValue || null;
  if (mapView) mapView.signal('state_selection', selected).run();
  if (donutView) donutView.signal('state_selection', selected).run();
}

// Load charts
Promise.all([
  fetch('js/map.json').then(r => r.json()),
  fetch('js/donut_chart.json').then(r => r.json()),
  fetch('js/funding_source_side_by_side.json').then(r => r.json()),
  fetch('js/bubble_chart.json').then(r => r.json())
])
  .then(([mapSpec, donutSpec, fundingSpec, bubbleSpec]) => {
    const cleanedMapSpec = removeInternalDropdown(mapSpec);
    const cleanedDonutSpec = removeInternalDropdown(donutSpec);

    return Promise.all([
      vegaEmbed('#hospital_map', cleanedMapSpec, {actions: false}),
      vegaEmbed('#hospital_bar', cleanedDonutSpec, {actions: false}),
      vegaEmbed('#funding_bar', fundingSpec, {actions: false}),
      vegaEmbed('#bubble_chart', bubbleSpec, {actions: false})
    ]);
  })
  .then(([mapRes, donutRes]) => {
    mapView = mapRes.view;
    donutView = donutRes.view;
    applyFilter(stateDropdown.value);
  })
  .catch(console.error);

// Event listener for dropdown
stateDropdown.addEventListener('change', e => {
  applyFilter(e.target.value);
});
