#!/usr/bin/env python3

import csv
import argparse
import sys

parser = argparse.ArgumentParser(description='Process moodle grade worksheet')
parser.add_argument('--gradefile', '-g', dest='gradefile',
                    help='the filename with student grades and feedback (that i wrote)')
parser.add_argument('--csv', '-c', dest='csvin',
                    help='the filename of the downloaded moodle csv grade sheet')
parser.add_argument('--outfile', '-o', dest='outfile',
                    help='name of the output file')
parser.add_argument('--force', '-f', default=False, action='store_true',
                    help='Don\'t error out on missing grades')
args = parser.parse_args()

if not args.csvin or not args.gradefile or not args.outfile:
    print ("Error: required arguments not given.")
    parser.print_help()
    sys.exit()

def read_gradedata(gradefile):
    d = {}
    grade = ''
    namelist = []
    feedback = []
    with open(gradefile, 'r') as grades:
        for line in grades:
            if line.startswith('#'):
                continue
            line = line.strip()
            if len(line) > 0 and line[0] == '!':
                fields = line[1:].split()
                # if len(fields) >= 2 and fields[-1].isdigit():
                if namelist and feedback:
                    for name in namelist:
                        d[name] = (grade,'\n'.join(feedback))
                    grade = ''
                    namelist = []
                    feedback = []

                grade = float(fields[-1])
                namelist = fields[:-1]
                # name = ' '.join(fields[:len(fields)-1])
            else:
                feedback.append(line)
        if namelist and feedback:
            for name in namelist:
                d[name] = (grade,'\n'.join(feedback))
    # print (d.keys())
    return d

def read_moodlecsv(csvin):
    with open(csvin, newline='') as csvfile:
        inreader = csv.DictReader(csvfile)
        data = {}
        for d in inreader:
            fullname = d['Full name']
            data[fullname] = d
        # print (data.keys())
        return (inreader.fieldnames, data)

def assign_grades(grades, sdata, force=False):
    # grades: name->grade,feedback
    # sdata: fullname->csvdict ('Grade','Maximum Grade')
    allnames = list(sdata.keys())
    for fullname, csvdict in sdata.items():
        last = fullname.split()[-1]
        lastlow = last.lower()
        firstinit = fullname.strip()[0]        
        twoinit = fullname.strip()[:2]

        # try: Last, lastf, FLast, last+two init
        lastf = last+firstinit
        lastf = lastf.lower()
        lasttwo = (last+twoinit).lower()
        flast = "{}{}".format(firstinit.capitalize(), last.capitalize())
        key = ''
        if last in grades:
            key = last
        elif lastlow in grades:
            key = lastlow
        elif lastf in grades:
            key = lastf
        elif flast in grades:
            key = flast
        elif lasttwo in grades:
            key = lasttwo
        if key:
            assert(grades[key][0] >= 0)
            assert(grades[key][0] <= float(csvdict['Maximum Grade']))
            csvdict['Grade'] = grades[key][0]
            csvdict['Feedback comments'] = grades[key][1]
            allnames.remove(fullname)
        else:
            print ("Couldn't find match for {} in grade info".format(fullname))
            if force:
                csvdict['Grade'] = ''
                csvdict['Feedback comments'] = 'Not yet graded'
                allnames.remove(fullname)

    for n in allnames:
        print("Error: no match for {} in grade info".format(n))
    assert(len(allnames) == 0)


def print_newcsv(outname, fieldnames, sdata):
    fieldnames = ['Email address','Grade','Feedback comments']
    with open(outname, 'w', newline='') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames, extrasaction='ignore')
        writer.writeheader()
        writer.writerows(sdata.values())

grades = read_gradedata(args.gradefile)
fields, student_data = read_moodlecsv(args.csvin)
assign_grades(grades, student_data, args.force)
print_newcsv(args.outfile, fields, student_data)
