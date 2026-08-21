filepath +:./modules/tardigrade
			

coord
{
	name		tardism
	parent		ISSscene
	scale			1
	unit			0.0001
	unitname		1 m
	entrydist		50
	
	position
	{
	static 0 600 0
	}
	
	rotation 
	{
	static hpr 0 0 0
	}
}

object tardi sgOrbitalObject
{
	coord tardism
	geometry SG_USES tardigrade.conf
	scalefactor 1


	
	targetradius 10	
	cameraradius 3
	lsize 10000000
	guiName /Solar System/Satellites/Tardigrade
	off
}

