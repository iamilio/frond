# Frond · Nature-based façade advisor

Frond is a web tool for architects in hot-arid climates. You import a building, and Frond ranks six nature-based façade systems for it against the current envelope.

**Live demo:** https://iamilio.github.io/frond/

> **Status: prototype v0.1.** The interface works, but the ranking uses **invented demo data**. The ML model (trained on about 2,000 EnergyPlus runs per system with a city weather file, Yazd first) is not built yet.

## The six systems

| System | Mechanism | Nature label |
|---|---|---|
| Green façade (climbing plants on a trellis) | Seasonal plant shade | Nature-based |
| Extensive green roof | Roof insulation and evapotranspiration | Nature-based |
| Date-palm fibre insulation | Thermal resistance | Nature-derived |
| Bio-based PCM + night ventilation | Latent heat storage | Nature-derived |
| Opaque ventilated façade | Ventilated cavity | Nature-inspired |
| Perforated brick screen | Fixed shade | Vernacular · nature-inspired |

Add-ons (not ranked): PV canopy and light reflective finish.

## Run locally

```
python -m http.server 8000
```

Then open http://localhost:8000.

## Credits

Built from the Strata Façade Studio release 1 code. Icons: Lucide (ISC, see `lucide-LICENSE.txt`).

Part of a PhD on nature-based solutions for energy-efficient buildings.
