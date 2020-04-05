# Changelog

## [1.4.1] 2020-04-04

Changes by @pksec

### Added

- Added VUE_APP_PINCODE_LENGTH_VALIDATION=<int> e.g., 6 for India; 4 for Swiss.
- Improved Readme for ``VUE_APP_REPORT_LOCATION_SELECTOR=postal-code`
- Added MAP view button immediately after submission page

## [1.4.0] 2020-04-04

### Added

- New home page
- Added global store to keep geocoding and reports data

### Changed

- The map is now a component
- Markers size is now logarithmic 

### Fixed

- The menu now closes after an action
- Mexico flag is now correct

## [1.3.0] 2020-03-31

### Added

- Adding other countries sites

### Fixed

- Postal code validation on load

## [1.2.0] 2020-03-31

### Fixed

- Do not show next page if send is not a success

### Added

- If no data is available for the current day, fallback to last date with data
- If the user location is known, center the map on his position with extra zoom : see new VUE_APP_VISU_MAP_ZOOM_LEVEL_LOCAL

## [1.1.2] 2020-03-31

### Changed

- Restore EN / FR FAQ translations

## [1.1.1] 2020-03-31

### Changed

- Translations updated

## [1.1.0] 2020-03-30

### Added

- Location selector is now customizable with VUE_APP_REPORT_LOCATION_SELECTOR (only postal code available tough)

## [1.0.1] 2020-03-30

### Fixed

- Map locations display

## [1.0.0] 2020-03-30

### Changed

- Changed dataset and geocoding data formats

## [0.5.2] 2020-03-29

### Added

- Languages are now configurable

## [0.5.1] 2020-03-29

### Changed

- Removing embedded geocoding source
- Remove postal code strict verification

## [0.5.0] 2020-03-28

### Added

- reCAPTCHA

### Changed

- Reporting is now done through a post function (reCAPTCHA compatible)
- Extract instance configuration in environment files

## [0.4.4] 2020-03-27

### Fixed

- Ensure proper use of recovered numbers (convert to number)

## [0.4.3] 2020-03-27

### Added

- Whatsapp / instagram share button

### Changed

- Default date filter to today

## [0.4.2] 2020-03-26

### Added

- Intro/data messages on report page
- Send app version for diagnostics

## [0.4.1] 2020-03-26

### Fixed

- Improve healthy options

## [0.4.0] 2020-03-25

### Changed

- Adding 'About' headlines
- Put filters above the map
- Use another geocoding data source (locations positions on map)
- Default day is now yesterday

### Added

- New FAQ page
- You can now report if you recovered from officially diagnosed Covid or not
- Map data update date is displayed

### Fixed

- Symptoms are not sent if not sick
- Keep active layer when changing date

## [0.3.0] 2020-03-25

### Changed

- Bubbles on the map now have a minimal size of 100m
- Layers have been splitted and only sick layers are enabled by default

## [0.2.1] 2020-03-25

### Fixed

- Default language selection
- Translations errors

## [0.2.0] 2020-03-25

### Added

- Show version in footer

### Changed

- Improved postal code filter based on the known codes
- Translations updated
- Data of the current day can be seen

## [0.1.0] 2020-03-24

- Initial stable release
