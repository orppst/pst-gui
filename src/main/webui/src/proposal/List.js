import React, {useState, useEffect} from 'react'
import { useTable } from 'react-table'

var proposalList = [{}];
var proposals = [{investigators: [{type: "none", person: {fullName: "", eMail: ""}}]}];

const getProposal = (index) => {
    //Find PI
    var investigator = {person: {fullName: "", eMail: ""}};
    investigator = proposals[index].investigators.find(inv => {return inv.type==='PI';});
    if(investigator === undefined) {
        investigator = {person: {fullName: "Unknown", eMail: "Unknown"}};
    }

    return {
        fullName: investigator.person.fullName,
        eMail: investigator.person.eMail,
        proposalTitle: proposals[index].title,
        kind: proposals[index].kind,
        summary: proposals[index].summary
    }
}

const getAllProposals = () => {
    var allProps = [{}];
    for (let i = 0; i < proposals.length; i++) {
        allProps.push(getProposal(i));
    }

    return allProps;
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
  const [isLoading, setIsLoading] = React.useState(true);
  //const [data, setData] = React.useState([]);

  useEffect(() => {

        async function fetchProposalData (){
          setIsLoading(true);
          fetch(window.location.pathname + '/proposalapi/proposals')
              .then(res => res.json())
              .then((data) => {
                  proposalList = data;
                  proposals.length = 0;
                  proposalList.forEach(prop => {
                      fetch(window.location.pathname + '/proposalapi/proposals/' + prop.dbid)
                          .then(res => res.json())
                          .then((data) => {
                              proposals.push(data);
                          })
                          .catch(console.log);
                  })
              })
              .then(setIsLoading(false))
              .catch(console.log);
        }
        fetchProposalData();
      },[]);

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
            Header: 'Summary',
            accessor: 'summary',
          },
        ],
      },
    ],
    [isLoading]
  )

  const newData = React.useMemo(() => getAllProposals(), [isLoading]);
  //setData(getAllProposals());

  return (
    <div>
      <Table columns={columns} data={newData} />
    </div>
  )
}