import { describe, expect, it } from 'vitest';
import {
  getGeometryParentScreen,
  getGeometryRouteMeta,
  getGeometrySoftActions,
  isGeometryCoreEditableScreen,
  moveGeometryMenuIndex,
} from './navigation';
import { geometryRequestToScreen } from './parser';

describe('geometry navigation', () => {
  it('returns route metadata and guide links', () => {
    expect(getGeometryRouteMeta('home').breadcrumb).toEqual(['Geometry']);
    expect(getGeometryRouteMeta('lineEquation').guideArticleId).toBe('geometry-coordinate');
    expect(getGeometryRouteMeta('sphere').breadcrumb).toEqual([
      'Geometry',
      '3D Solids',
      'Sphere',
    ]);
    expect(getGeometryRouteMeta('square').focusTarget).toBe('guidedForm');
    expect(getGeometryRouteMeta('triangleArea').editorMode).toBe('editable');
  });

  it('clamps menu movement within bounds', () => {
    expect(moveGeometryMenuIndex('home', 0, -1)).toBe(0);
    expect(moveGeometryMenuIndex('home', 2, 10)).toBe(4);
    expect(moveGeometryMenuIndex('circleHome', 0, 10)).toBe(1);
  });

  it('returns correct parent screens', () => {
    expect(getGeometryParentScreen('home')).toBeNull();
    expect(getGeometryParentScreen('square')).toBe('shapes2dHome');
    expect(getGeometryParentScreen('cube')).toBe('shapes3dHome');
    expect(getGeometryParentScreen('distance')).toBe('coordinateHome');
  });

  it('uses menu-aware and tool-aware soft actions', () => {
    expect(getGeometrySoftActions('home').map((action) => action.id)).toEqual([
      'open',
      'guide',
      'back',
      'exit',
    ]);
    expect(getGeometrySoftActions('lineEquation').map((action) => action.id)).toEqual([
      'evaluate',
      'guide',
      'menu',
      'clear',
      'history',
    ]);
  });

  it('marks all geometry tools as shared-core editable screens', () => {
    expect(isGeometryCoreEditableScreen('home')).toBe(true);
    expect(isGeometryCoreEditableScreen('square')).toBe(true);
    expect(isGeometryCoreEditableScreen('triangleHeron')).toBe(true);
    expect(isGeometryCoreEditableScreen('sphere')).toBe(true);
  });

  it('maps parsed request kinds back to geometry screens', () => {
    expect(geometryRequestToScreen({ kind: 'cube', sideLatex: '3' })).toBe('cube');
    expect(geometryRequestToScreen({ kind: 'triangleHeron', aLatex: '5', bLatex: '6', cLatex: '7' })).toBe('triangleHeron');
    expect(geometryRequestToScreen({ kind: 'distanceSolveMissing', p1: { xLatex: '0', yLatex: '0' }, p2: { xLatex: '3', yLatex: '?' }, distanceLatex: '5' })).toBe('distance');
    expect(geometryRequestToScreen({ kind: 'coneSolveMissing', radiusLatex: '?', heightLatex: '4', slantHeightLatex: '?', volumeLatex: '12*pi', unknown: 'radius' })).toBe('cone');
    expect(geometryRequestToScreen({ kind: 'cuboidSolveMissing', lengthLatex: '?', widthLatex: '3', heightLatex: '4', diagonalLatex: '13', unknown: 'length' })).toBe('cuboid');
    expect(geometryRequestToScreen({ kind: 'arcSectorSolveMissing', radiusLatex: '?', angleLatex: '60', angleUnit: 'deg', arcLatex: '2*pi', unknown: 'radius' })).toBe('arcSector');
    expect(geometryRequestToScreen({ kind: 'triangleHeronSolveMissing', aLatex: '?', bLatex: '13', cLatex: '14', areaLatex: '84', unknown: 'a' })).toBe('triangleHeron');
  });
});
