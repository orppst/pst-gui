import React from 'react'
import { useTable } from 'react-table'

const range = len => {
  const arr = []
  for (let i = 0; i < len; i++) {
    arr.push(i)
  }
  return arr
}

const newProposal = () => {
  const statusChance = Math.random()
  return {
    title: "Dr",
    firstName: "Fred",
    lastName: "Bloggs",
    poposalTitle: "Propsal Name #" + Math.floor(Math.random() * 100),
    progress: Math.floor(Math.random() * 100),
    status:
      statusChance > 0.66
        ? 'Approved'
        : statusChance > 0.33
        ? 'Submitted'
        : 'Draft',
  }
}

function makeData(...lens) {
  const makeDataLevel = (depth = 0) => {
    const len = lens[depth]
    return range(len).map(d => {
      return {
        ...newProposal(),
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

export default function ListProposals() {

   fetch(window.location.pathname + '/proposalapi/proposals')
       .then(res => res.json())
       .then((data) => {
           console.log(data)
       })
       .catch(console.log);


  const columns = React.useMemo(
    () => [
      {
        Header: 'Principal Investigator',
        columns: [
          {
            Header: 'Title',
            accessor: 'title',
          },
          {
            Header: 'First Name',
            accessor: 'firstName',
          },
          {
            Header: 'Last Name',
            accessor: 'lastName',
          },
        ],
      },
      {
        Header: 'Propsal Info',
        columns: [
          {
            Header: 'Title',
            accessor: 'poposalTitle',
          },
          {
            Header: 'Status',
            accessor: 'status',
          },
          {
            Header: 'Progress',
            accessor: 'progress',
          },
        ],
      },
    ],
    []
  )

  const data = React.useMemo(() => makeData(20), [])

  return (
    <div>
      <Table columns={columns} data={data} />
    </div>
  )
}