import React, {useEffect} from 'react'
import { useTable } from 'react-table'

var proposalList = [{}];
var proposals = [{investigators: [{type: "none", person: {fullName: "", eMail: ""}}]}];

const fetchProposalData = () => {
    fetch(window.location.pathname + '/proposalapi/proposals')
        .then(res => res.json())
        .then((data) => {
            proposalList = data;
            proposals.splice();
            proposalList.forEach(prop => {
                fetch(window.location.pathname + '/proposalapi/proposals/' + prop.dbid)
                    .then(res => res.json())
                    .then((data) => {
                        proposals.push(data);
                    })
                    .catch(console.log);
                })
        })
        .catch(console.log);
    }

const range = len => {
  const arr = []
  for (let i = 0; i < len; i++) {
    arr.push(i)
  }
  return arr
}

const getProposal = () => {
    //Find PI
    var index = proposals.length-1;
    var investigator = {person: {fullName: "", eMail: ""}};
    investigator = proposals[index].investigators.find(inv => {return inv.type==='PI';});
    if(investigator === undefined) {
        console.log("undefined investigator");
        console.log(proposals);
        investigator = {person: {fullName: "Unknown", eMail: "Unknown"}};
    }

    return {
        fullName: investigator.person.fullName,
        eMail: investigator.person.eMail,
        proposalTitle: proposals[index].title,
        kind: proposals[index].kind,
        submitted: proposals[index].submitted
    }
}

function makeData(...lens) {
  const makeDataLevel = (depth = 0) => {
    const len = lens[depth]
    return range(len).map(d => {
      return {
        ...getProposal(),
        subRows: lens[depth + 1] ? makeDataLevel(depth + 1) : undefined,
      }
    })
  }

  return makeDataLevel()
}


function Table({ columns, data }) {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable({
    columns,
    data,
  })

  // Render the UI for your table
  return (
    <table {...getTableProps()}>
      <thead>
        {headerGroups.map(headerGroup => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map(column => (
              <th {...column.getHeaderProps()}>{column.render('Header')}</th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody {...getTableBodyProps()}>
        {rows.map((row, i) => {
          prepareRow(row)
          return (
            <tr {...row.getRowProps()}>
              {row.cells.map(cell => {
                return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
              })}
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

fetchProposalData();

export default function ListProposals() {

  //fetchProposalData();

  const columns = React.useMemo(
    () => [
      {
        Header: 'Principal Investigator',
        columns: [
          {
            Header: 'Name',
            accessor: 'fullName',
          },
          {
            Header: 'email',
            accessor: 'eMail',
          },
        ],
      },
      {
        Header: 'Proposal Info',
        columns: [
          {
            Header: 'Title',
            accessor: 'proposalTitle',
          },
          {
            Header: 'Kind',
            accessor: 'kind',
          },
          {
            Header: 'Submitted',
            accessor: 'submitted',
          },
        ],
      },
    ],
    []
  )

  const data = React.useMemo(() => makeData(proposalList.length), [])

  return (
    <div>
      <Table columns={columns} data={data} />
    </div>
  )
}