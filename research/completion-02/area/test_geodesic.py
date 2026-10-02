import unittest
from derive_area import mapped_area

def box(x0,y0,x1,y1):
    return {'type':'Polygon','coordinates':[[[x0,y0],[x1,y0],[x1,y1],[x0,y1],[x0,y0]]]}

class GeodesicTests(unittest.TestCase):
    def test_known_one_degree(self):
        self.assertAlmostEqual(mapped_area([box(0,0,1,1)]),12308.778361,places=5)
    def test_duplicate_not_counted_twice(self):
        p=box(0,0,1,1)
        self.assertEqual(mapped_area([p,p]),mapped_area([p]))
    def test_overlap_union(self):
        self.assertAlmostEqual(mapped_area([box(0,0,1,1),box(.5,0,1.5,1)]),mapped_area([box(0,0,1.5,1)]),delta=1)
    def test_holes_subtracted(self):
        outer=box(0,0,2,2);hole=box(.5,.5,1.5,1.5)
        with_hole={'type':'Polygon','coordinates':outer['coordinates']+hole['coordinates']}
        self.assertAlmostEqual(mapped_area([with_hole]),mapped_area([outer])-mapped_area([hole]),places=7)
    def test_dateline_small_not_world(self):
        self.assertAlmostEqual(mapped_area([box(179,0,-179,1)]),mapped_area([box(-1,0,1,1)]),places=7)
    def test_invalid_source_topology_rejected(self):
        with self.assertRaises(ValueError):
            mapped_area([{'type':'Polygon','coordinates':[[[0,0],[1,1],[0,1],[1,0],[0,0]]]}])
    def test_out_of_range_rejected(self):
        with self.assertRaises(ValueError):mapped_area([box(0,90,1,91)])
    def test_nonpolygon_rejected(self):
        with self.assertRaises(ValueError):mapped_area([{'type':'Point','coordinates':[0,0]}])

if __name__=='__main__':unittest.main()
