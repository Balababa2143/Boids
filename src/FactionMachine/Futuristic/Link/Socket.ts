/**
 * The attachment points a link can be fastened to, one constant per joint.
 *
 * A socket is a shrine tag, and a shrine tag only exists while something on the
 * body carries it: the cuffs, the mittens and the ballet heels all list the
 * sockets they offer in their `shrine`. An item built with `RequireSocket` can
 * only be worn, and only render, while one of those items is on. The values are
 * uuids so that two families can agree on a joint without agreeing on a spelling.
 * @module FactionMachine/Futuristic/Link/Socket
 */

/**
 * The wrist socket, offered by the arm cuff, the wrist cuff and the mittens. An
 * item that requires it can only be worn while one of them is on.
 */
export const Wrist = '6C035995-F25A-4275-82D5-9CC157093E3F'

/**
 * The elbow socket, offered by the arm cuff and the elbow cuff. An item that
 * requires it can only be worn while one of them is on.
 */
export const Elbow = '8B3D8FF7-D09E-4E56-B014-233A1BB54140'

/**
 * The thigh socket, offered by the thigh cuff. An item that requires it can only
 * be worn while the cuff is on.
 */
export const Thigh = '74E4E3B1-436A-4BB8-B7A2-0448E260A23C'

/**
 * The ankle socket, offered by the ankle cuff and the ballet heels. An item that
 * requires it can only be worn while one of them is on.
 */
export const Ankle = '6972C883-57B8-4A0F-B965-F0A42654415B'