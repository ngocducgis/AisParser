// @flow

import AisBitField from './AisBitField';
import AisMessage from './AisMessage';

const MOD_NAME = 'Ais21Msg';
const DEBUG = false;
/*
|==============================================================================
|Field    |Len |Description            |Member      |T|Units
|0-5      | 6  |Message Type           |type        |u|Constant: 21
|6-7      | 2  |Repeat Indicator       |repeat      |u|As in CNB
|8-37     |30  |MMSI                   |mmsi        |u|9 digits
|38-42    | 5  |Aid type               |aid_type    |e|See "Navaid Types"
|43-162  1|120 |Name                   |name        |t|Name in sixbit chars
|163-163  | 1  |Position Accuracy      |accuracy    |b|As in CNB
|164-191  |28  |Longitude              |lon         |I4|Minutes/10000 (as in CNB)
|192-218  |27  |Latitude               |lat         |I4|Minutes/10000 (as in CNB)
|219-227  | 9  |Dimension to Bow       |to_bow      |u|Meters
|228-236  | 9  |Dimension to Stern     |to_stern    |u|Meters
|237-242  | 6  |Dimension to Port      |to_port     |u|Meters
|243-248  | 6  |Dimension to Starboard |to_starboard|u|Meters
|249-252  | 4  |Type of EPFD           |epfd        |e|As in Message Type 4
|253-258  | 6  |UTC Second             |second      |u|As in Message Type 5
|259-259  | 1  |Off-Position Indicator |off_position|b|See Below
|260-267  | 8  |Regional reserved      |regional    |u|Uninterpreted
|268-268  | 1  |RAIM flag              |raim        |b|As in CNB
|269-269  | 1  |Virtual-aid flag       |virtual_aid |b|See Below
|270-270  | 1  |Assigned-mode flag     |assigned    |b|See <<IALA>> for details
|271-271  | 1  |Spare                  |            |x|Not used
|272-360  |88  |Name Extension         |            |t|See Below
|==============================================================================
*/

const SUPPORTED_VALUES = [
  'aisType',
  'channel',
  'repeatInd',
  'mmsi',
  'name',
  'latitude',
  'longitude',
  'posAccuracy',
  'dimToBow',
  'dimToStern',
  'dimToPort',
  'dimToStbrd',
  'length',
  'width',
  'epfd',
  'epfdStr',
  'utcTsSec',
  'utcStatus',
  'offPosInd',
  'aidType',
  'aidTypeStr',
  'nameExt'
 ];


export default class Ais21Msg extends AisMessage {
  constructor(aisType : number,bitField : AisBitField, channel : string) {
    super(aisType,bitField,channel);
    this._valid = 'VALID';
  }

  get supportedValues() : Array<string> {
    return SUPPORTED_VALUES;
  }

  // |38-42    | 5  |Aid type               |aid_type    |e|See "Navaid Types"
  get aidType() : number {
    return this._bitField.getInt(38,5,true);
  }

  //  |43-162  1|120 |Name                   |name        |t|Name in sixbit chars
  get name() : string {
    return this._formatStr(this._bitField.getString(43,162));
  }

  // |163-163  | 1  |Position Accuracy      |accuracy    |b|As in CNB
  get posAccuracy() : boolean {
    return this._bitField.getInt(163, 1, true) === 1;
  }

  // |164-191  |28  |Longitude              |lon         |I4|Minutes/10000 (as in CNB)
  _getRawLon() : number {
    return this._bitField.getInt(164,28,false);
  }

  //|192-218  |27  |Latitude               |lat         |I4|Minutes/10000 (as in CNB)
  _getRawLat() : number {
    return this._bitField.getInt(192,27,false);
  }

  // |219-227  | 9  |Dimension to Bow       |to_bow      |u|Meters
  get dimToBow() : number {
    return this._bitField.getInt(219,9,true);
  }

  // |228-236  | 9  |Dimension to Stern     |to_stern    |u|Meters
  get dimToStern() : number {
    return this._bitField.getInt(228,9,true);
  }

  // |237-242  | 6  |Dimension to Port      |to_port     |u|Meters
  get dimToPort() : number {
    return this._bitField.getInt(237,6,true);
  }

  // |243-248  | 6  |Dimension to Starboard |to_starboard|u|Meters
  get dimToStbrd() : number {
    return this._bitField.getInt(243,6,true);
  }

  // |249-252  | 4  |Type of EPFD           |epfd        |e|As in Message Type 4
  get epfd() : number {
    return this._bitField.getInt(249,4,true);
  }

  // |253-258  | 6  |UTC Second             |second      |u|As in Message Type 5
  _getUtcSec() : number {
    return this._bitField.getInt(253,6,true);
  }

  // |259-259  | 1  |Off-Position Indicator |off_position|b|See Below
  get offPosInd() : 'IN_POS' | 'OFF_POS' | 'NA' {
    if(this._getUtcSec() < 60) {
      return (this._bitField.getInt(163, 1, true) === 0) ? 'IN_POS' : 'OFF_POS';
    } else {
      return 'NA';
    }
  }

  // |272-360  |88  |Name Extension         |            |t|See Below
  get nameExt() : string {
    if(this._bitField.bits > 272) {
      let chars : number = Math.floor((this._bitField.bits - 272) / 6);
      if(chars > 0) {
        return this._formatStr(this._bitField.getString(272,chars * 6));
      }
    }
  return '';
  }
}
