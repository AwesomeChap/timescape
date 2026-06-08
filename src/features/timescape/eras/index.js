import { era1617 } from './era1617';
import { era1773 } from './era1773';
import { era1944 } from './era1944';
import { era1996 } from './era1996';

export const TIMELINE_ERAS = [era1617, era1773, era1944, era1996];

export const ERA_POINT_KEYS = TIMELINE_ERAS.map((era) => era.pointKey);

export const ERA_COLORS = TIMELINE_ERAS.map((era) => era.color);
