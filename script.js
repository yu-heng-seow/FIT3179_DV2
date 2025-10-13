const stateDropdown = document.getElementById('stateFilter');
let mapView, barView;

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
  if (barView) barView.signal('state_selection', selected).run();
}

// Load charts
Promise.all([
  fetch('js/map.json').then(r => r.json()),
  fetch('js/bar_chart.json').then(r => r.json()),
  fetch('js/funding_source_side_by_side.json').then(r => r.json()),
  fetch('js/bubble_chart.json').then(r => r.json())
])
  .then(([mapSpec, barSpec, fundingSpec, bubbleSpec]) => {
    const cleanedMapSpec = removeInternalDropdown(mapSpec);
    const cleanedBarSpec = removeInternalDropdown(barSpec);

    return Promise.all([
      vegaEmbed('#hospital_map', cleanedMapSpec, {actions: false}),
      vegaEmbed('#hospital_bar', cleanedBarSpec, {actions: false}),
      vegaEmbed('#funding_bar', fundingSpec, {actions: false}),
      vegaEmbed('#bubble_chart', bubbleSpec, {actions: false})
    ]);
  })
  .then(([mapRes, barRes]) => {
    mapView = mapRes.view;
    barView = barRes.view;
    applyFilter(stateDropdown.value);
  })
  .catch(console.error);

// Event listener for dropdown
stateDropdown.addEventListener('change', e => {
  applyFilter(e.target.value);
});
