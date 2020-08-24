const iconv = require('iconv');
const fs = require('fs');
const xml2js = require('xml2js');
const db = require('./models');

const xmlAddress = fs.readFileSync('public/xml/28-ex_xml_atu.xml');

const body = new Buffer(xmlAddress, 'binary');
const conv = new iconv.Iconv('windows-1251', 'utf8');
const addresUTF8 = conv.convert(body).toString('utf8');

const parser = new xml2js.Parser();

let address;

parser.parseString(addresUTF8, function (err, result) {
    console.log(result.DATA.RECORD[1000]);
    address = result.DATA.RECORD;
    console.log('Done');
});

fs.writeFileSync('address.json', JSON.stringify(address));

let uniqueRegions = [...new Set(address
    .map(obj => obj.OBL_NAME[0])
    .filter(region => !((region === 'м.Севастополь') || (region === 'м.Київ'))))];

fs.writeFileSync('regions.json', JSON.stringify(uniqueRegions));

let addressObj = JSON.parse(fs.readFileSync('address.json').toString());

const regions = JSON.parse(fs.readFileSync('regions.json').toString());


const createRegion = async (regions) => {
    try {
        for (const region of regions) {
            const {id, name} = await db.Region.create({
                name: region
            });


            const citiesFromStreets = {};

            const citiesByRegion = addressObj
                .map(addr => {
                    if (addr.OBL_NAME[0] === name) {
                        if (!(addr.REGION_NAME[0].trim() || addr.CITY_REGION_NAME[0].trim())) {

                            //**************************************************************************
                            if (!citiesFromStreets[addr.CITY_NAME[0]]) {
                                citiesFromStreets[addr.CITY_NAME[0]] = [addr.STREET_NAME[0]]
                            } else citiesFromStreets[addr.CITY_NAME[0]].push(addr.STREET_NAME[0]);
                            //**************************************************************************

                            return {
                                city: addr.CITY_NAME[0],
                                streets: [addr.STREET_NAME[0]]
                            }
                        }
                        if (addr.CITY_NAME[0].trim() && addr.CITY_REGION_NAME[0].trim()) {

                            //**************************************************************************
                            if (!citiesFromStreets[!`${addr.CITY_REGION_NAME[0]} (${addr.CITY_NAME[0]})`]) {
                                citiesFromStreets[`${addr.CITY_REGION_NAME[0]} (${addr.CITY_NAME[0]})`] = [addr.STREET_NAME[0]]
                            } else citiesFromStreets[`${addr.CITY_REGION_NAME[0]} (${addr.CITY_NAME[0]})`].push(addr.STREET_NAME[0]);
                            //**************************************************************************

                            return {
                                city: `${addr.CITY_REGION_NAME[0]} (${addr.CITY_NAME[0]})`,
                                streets: [addr.STREET_NAME[0]]
                            }
                        }
                        if (addr.REGION_NAME[0].trim() && addr.CITY_NAME[0].trim()) {

                            //**************************************************************************
                            if (!citiesFromStreets[
                                !addr.CITY_NAME[0].includes('Не визначений')
                                    ? `${addr.CITY_NAME[0]} (${addr.REGION_NAME[0]})`
                                    : '']) {
                                citiesFromStreets[
                                    !addr.CITY_NAME[0].includes('Не визначений')
                                        ? `${addr.CITY_NAME[0]} (${addr.REGION_NAME[0]})`
                                        : ''] = [addr.STREET_NAME[0]]
                            } else citiesFromStreets[
                                !addr.CITY_NAME[0].includes('Не визначений')
                                    ? `${addr.CITY_NAME[0]} (${addr.REGION_NAME[0]})`
                                    : ''].push(addr.STREET_NAME[0]);
                            //**************************************************************************

                            return {
                                city: !addr.CITY_NAME[0].includes('Не визначений')
                                    ? `${addr.CITY_NAME[0]} (${addr.REGION_NAME[0]})`
                                    : '',
                                streets: [addr.STREET_NAME[0]]
                            }
                        }
                    }
                    if (name === 'Автономна Республіка Крим') {
                        if (addr.OBL_NAME[0] === 'м.Севастополь'
                            && addr.REGION_NAME[0].trim()
                            && addr.CITY_NAME[0].trim()
                        ) {

                            //**************************************************************************
                            if (!citiesFromStreets[`${addr.CITY_NAME[0]} (${addr.REGION_NAME[0]})`]) {
                                citiesFromStreets[`${addr.CITY_NAME[0]} (${addr.REGION_NAME[0]})`] = [addr.STREET_NAME[0]]
                            } else citiesFromStreets[`${addr.CITY_NAME[0]} (${addr.REGION_NAME[0]})`].push(addr.STREET_NAME[0]);
                            //**************************************************************************

                            return {
                                city: `${addr.CITY_NAME[0]} *(${addr.REGION_NAME[0]})*`,
                                streets: [addr.STREET_NAME[0]]
                            }
                        }
                        if (
                            addr.OBL_NAME[0] === 'м.Севастополь'
                            && !addr.REGION_NAME[0].trim()
                            && !addr.CITY_NAME[0].trim()
                        ) {

                            //**************************************************************************
                            if (!citiesFromStreets[`${addr.OBL_NAME[0]}`]) {
                                citiesFromStreets[`${addr.OBL_NAME[0]}`] = [addr.STREET_NAME[0]]
                            } else citiesFromStreets[`${addr.OBL_NAME[0]}`].push(addr.STREET_NAME[0]);
                            //**************************************************************************

                            return {
                                city: `${addr.OBL_NAME[0]}`,
                                streets: [addr.STREET_NAME[0]]
                            }
                        }
                    }
                    if (name === 'Київська обл.') {
                        if (addr.OBL_NAME[0] === 'м.Київ'
                            && !addr.REGION_NAME[0].trim()
                            && !addr.CITY_NAME[0].trim()
                            && !addr.CITY_REGION_NAME[0].trim()) {

                            //**************************************************************************
                            if (!citiesFromStreets[`${addr.OBL_NAME[0]}`]) {
                                citiesFromStreets[`${addr.OBL_NAME[0]}`] = [addr.STREET_NAME[0]]
                            } else citiesFromStreets[`${addr.OBL_NAME[0]}`].push(addr.STREET_NAME[0]);
                            //**************************************************************************

                            return {
                                city: `${addr.OBL_NAME[0]}`,
                                streets: [addr.STREET_NAME[0]]
                            }
                        }
                    }
                })
                .filter(f => f)
                .map(function (cityObj, index, arr, thisArg) {
                    const key = cityObj.city;
                    if (!this[key]) {
                        this[key] = true;
                    }
                    return cityObj
                }, {});
            // .filter(cityObj => cityObj.city);

            for (const [key, value] of Object.entries(citiesFromStreets)) {
                if (key) {
                    const {id: cityId} = await db.City.create({
                        name: key,
                        regionId: id
                    });
                    for (const street of value.filter(f => f)) {
                        await db.Street.create({
                            name: street,
                            cityId
                        })
                    }
                }

            }
        }
    } catch (e) {
        console.log(e);
    }
};
createRegion(regions);
